// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// 'vars
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
CLIENT_SECRET = "BFfk3o2Pn4mgUV06vnk9sZQRBQ4Q7-aqmma7MJ6lPxw";
CLIENT_ID = "PQP6tEWH8EtgYFIl5EIluYy1L0QQoB_RqPXZ8ItIfJQ";
audiothumb =
  "https://freight.cargo.site/t/original/i/a751fe153c4e1585493966c661701b0c6802a23afe8abb963af17b8188b50621/audio-icon.png";
vimeothumb =
  "https://freight.cargo.site/t/original/i/973f26b39d768e6fe9e2a5d7367d12f820261f9bb50485c1db391256d622f71e/passwordProtected-icon.png";
pdfthumb =
  "https://freight.cargo.site/t/original/i/1b86a597f22415c80c2c48238abac1a373cd76954e374223b44735c8d2323733/PDF-icon.png";

// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// 'begin
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
function myFunction() {
  processSheetAsync();
}

//done with helpers
async function processSheetAsync() {
  await processSheet();
}
// process sheet
async function processSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("ALL");
  if (!sheet) {
    throw new Error('Sheet "Projects" not found.');
  } else {
    Logger.log('Sheet "Projects" found.');
  }

  const assetSheet = getOrCreateAssetSheet();
  const service = getArenaService();

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    let cell = data[i][2]; // Column C (0-based index = 2)
    let title_cell = data[i][0];
    let updatedCell = cell;

    const blockIds = extractArenaBlockIds(cell);
    const videoIds = await extractVideoIds(cell, data[i][0]);

    Logger.log(
      i +
        "  " +
        data[i][0] +
        "  blockIds" +
        blockIds +
        "  " +
        " videoIds" +
        videoIds,
    );
    if (blockIds.length === 0 && videoIds === null) {
      Logger.log("No Arena or video links found in row " + (i + 1));
      continue;
    }

    // its video
    else if (videoIds != null) {
      const assetId = "asset_" + `${videoIds.platform}_` + videoIds.id;
      // Logger.log(videoIds.id);
      const row = [
        assetId,
        videoIds.title || "",
        videoIds.url || "",
        videoIds.thumbnail || "",
        "",
        "",
      ];
      Logger.log("upserting asset: " + assetId);
      Logger.log("upserting asset: " + row.thumbnail);
      upsertAsset(assetSheet, row);
      updatedCell = assetId;
    }
    //its are.na
    else if (blockIds.length > 0) {
      blockIds.forEach((id) => {
        const block = fetchArenaBlock(id, service);

        const assetId = "asset_arena_" + id;

        // Build asset row
        let urlsrc, urlthumb;
        if (block.class == "Attachment") urlsrc = block.attachment?.url ?? "";
        else if (block.class == "Link") urlsrc = block.source.url;
        else urlsrc = block.image?.src ?? block.attachment?.url ?? "";

        urlthumb = block.image?.src ?? "";
        //things
        if (block.attachment) {
          if (block.attachment.contentType == "audio/mpeg")
            urlthumb = audiothumb;
          else if (
            block.attachment.contentType == "application/pdf" &&
            !urlthumb
          )
            urlthumb = pdfthumb;
        }

        const row = [
          assetId,
          block.title || "",
          urlsrc,
          urlthumb,
          block.description ? block.description.plain : "",
          extractAltText(block),
        ];
        Logger.log("upserting asset: " + assetId);
        upsertAsset(assetSheet, row);

        // // Replace URL in main sheet with asset ID
        // updatedCell = updatedCell.replace(
        //   new RegExp(`https://www.are.na/block/${id}`, "g"),
        //   assetId,
        // );
      });
    }

    // slug generator
    sheet.getRange(i + 1, 22).setValue(SLUG(title_cell));
    // id generator
    sheet.getRange(i + 1, 21).setValue(updatedCell);
  }
}

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
      platform: "yt",
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);

  if (vimeoMatch) {
    return {
      url: url || "",
      title: title || "",
      id: vimeoMatch[1],
      platform: "vimeo",
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

function getOrCreateAssetSheet() {
  const gg = SpreadsheetApp.getActiveSpreadsheet();
  let assetSheet = gg.getSheetByName("Assets");

  if (!assetSheet) {
    assetSheet = gg.insertSheet("Assets");
    gg.setActiveSheet(assetSheet);
    assetSheet.appendRow([
      "id",
      "title",
      "src",
      "thumbnailURL",
      "description",
      "alt_text",
    ]);
  }
  gg.setActiveSheet(assetSheet);
  gg.moveActiveSheet(gg.getSheets().length);

  return assetSheet;
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
  if (block.attachment) return block.description ? block.description.plain : "";

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
  try {
    const response = UrlFetchApp.fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
      { muteHttpExceptions: true },
    );
    const code = response.getResponseCode();

    if (code !== 200) {
      return vimeothumb;
    }

    const data = JSON.parse(response.getContentText());
    Logger.log("Vimeo API response: " + data);
    return data.thumbnail_url ? data.thumbnail_url : vimeothumb; // Return the thumbnail URL or a default thumbnail if not available
  } catch (error) {
    return vimeothumb;
  }
}
