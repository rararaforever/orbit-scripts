function myFunction() {
  CLIENT_ID = "PQP6tEWH8EtgYFIl5EIluYy1L0QQoB_RqPXZ8ItIfJQ";
  CLIENT_SECRET = "BFfk3o2Pn4mgUV06vnk9sZQRBQ4Q7-aqmma7MJ6lPxw";

  processSheet();
  function getArenaService() {
    return OAuth2.createService("Arena")

      .setAuthorizationBaseUrl("www.are.na/oauth/authorize")

      .setTokenUrl("api.are.na/v3/oauth/token")

      .setClientId(CLIENT_ID)

      .setClientSecret(CLIENT_SECRET)

      .setCallbackFunction("authCallback")

      .setPropertyStore(PropertiesService.getUserProperties())

      .setScope("read");
  }
  function authorize() {
    const service = getArenaService();

    if (!service.hasAccess()) {
      Logger.log(service.getAuthorizationUrl());
    }
  }
  function testRedirect() {
    Logger.log(OAuth2.getRedirectUri());
  }

  function extractArenaBlockIds(text) {
    if (!text) return [];

    const regex = /are\.na\/block\/(\d+)/g;

    let matches;
    let ids = [];

    while ((matches = regex.exec(text)) !== null) {
      ids.push(matches[1]);
    }
    return ids;
  }
  async function extractVideoIds(url, title) {
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([^&?/]+)/,
    );

    if (ytMatch) {
      return {
        url: url || "",
        title: title || "",
        id: ytMatch[1],
        thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
      };
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);

    if (vimeoMatch) {
      return {
        url: url || "",
        title: title || "",
        id: vimeoMatch[1],
        thumbnail: await getVimeoThumbnail(url), // Vimeo requires an API/oEmbed call
      };
    } else {
      return null;
    }
  }

  function fetchArenaBlock(blockId, service) {
    const url = `https://api.are.na/v3/blocks/${blockId}`;

    const response = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: "Bearer " + service.getAccessToken(),
      },
    });

    return JSON.parse(response.getContentText());
  }

  function processSheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const assetSheet = getOrCreateAssetSheet();

    const service = getArenaService();

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      let cell = data[i][2]; // Column C (0-based index = 2)
      let title_cell = data[i][0];
      let updatedCell = cell;

      const blockIds = extractArenaBlockIds(cell);
      const videoIds = extractVideoIds(cell, data[i][0]);

      Logger.log(
        i + "  " + " blockIds" + blockIds + "  " + " videoIds" + videoIds,
      );
      if (blockIds.length === 0 && videoIds === null) continue;
      else if (videoIds != null) {
        const assetId = "asset_" + videoIds.id;
        // Logger.log(videoIds.id);
        const row = [
          assetId,
          videoIds.title || "",
          videoIds.url || "",
          videoIds.thumbnail || "",
          "",
          "",
        ];
        upsertAsset(assetSheet, row);
        updatedCell = assetId;
      } else if (blockIds.length > 0) {
        blockIds.forEach((id) => {
          const block = fetchArenaBlock(id, service);

          const assetId = "asset_" + id;

          // Build asset row
          let urlsrc, urlthumb;
          if (block.class == "Attachment") urlsrc = block.attachment?.url ?? "";
          else if (block.class == "Link") urlsrc = block.source.url;
          else urlsrc = block.image?.src ?? block.attachment?.url ?? "";

          urlthumb = block.image?.src ?? "";

          const row = [
            assetId,
            block.title || "",
            urlsrc,
            urlthumb,
            block.description ? block.description.plain : "",
            extractAltText(block),
          ];

          upsertAsset(assetSheet, row);

          // Replace URL in main sheet with asset ID
          updatedCell = updatedCell.replace(
            new RegExp(`https://www.are.na/block/${id}`, "g"),
            assetId,
          );
        });
      }
      // slug generator
      sheet.getRange(i + 1, 21).setValue(SLUG(title_cell));
      // id generator
      sheet.getRange(i + 1, 20).setValue(updatedCell);
    }
  }
  function getOrCreateAssetSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    let sheet = ss.getSheetByName("Assets");

    if (!sheet) {
      sheet = ss.insertSheet("Assets");
      sheet.appendRow([
        "id",
        "title",
        "src",
        "thumbnailURL",
        "description",
        "alt_text",
      ]);
    }

    return sheet;
  }

  function upsertAsset(sheet, row) {
    const data = sheet.getDataRange().getValues();

    const id = row[0];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
        return;
      }
    }

    sheet.appendRow(row);
  }

  function extractAltText(block) {
    if (!block) return "";
    if (block.attachment)
      return block.description ? block.description.plain : "";

    if (block.image && block.image.alt_text) return block.image.alt_text;

    return "";
  }

  function slugify(text, maxWords = 7) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .slice(0, maxWords)
      .join(" ")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function SLUG(input) {
    return slugify(input);
  }

  async function getVimeoThumbnail(url) {
    const response = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
    );
    if (!response.ok) return null;

    const data = await response.json();
    return data.thumbnail_url;
  }
}
