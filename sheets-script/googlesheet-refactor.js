// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// 'vars
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// main sheet thing
// CLIENT_ID = "x91hTbRviyLEV2zyCmwfMoMHqMJYyI6v3Eni35covms";
// CLIENT_SECRET = "F2EayKLHehZRrl7YfxdrjM1dWIkZ_66UsvXfOkwVQUM";

CLIENT_SECRET = "BFfk3o2Pn4mgUV06vnk9sZQRBQ4Q7-aqmma7MJ6lPxw";
CLIENT_ID = "PQP6tEWH8EtgYFIl5EIluYy1L0QQoB_RqPXZ8ItIfJQ";

audiothumb =
  "https://freight.cargo.site/t/original/i/a751fe153c4e1585493966c661701b0c6802a23afe8abb963af17b8188b50621/audio-icon.png";
vimeothumb =
  "https://freight.cargo.site/t/original/i/973f26b39d768e6fe9e2a5d7367d12f820261f9bb50485c1db391256d622f71e/passwordProtected-icon.png";
pdfthumb =
  "https://freight.cargo.site/t/original/i/1b86a597f22415c80c2c48238abac1a373cd76954e374223b44735c8d2323733/PDF-icon.png";
assetIdClmn = "U";
slugIdClmn = "V";
//change the u to number charater it is
slugIdNum = slugIdClmn.charCodeAt(0) - 65 + 1;
assetIdNum = assetIdClmn.charCodeAt(0) - 65 + 1;
let spreadsheet;
let sheet;
let assetSheet;
let service;
let index = 2;
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// begin
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
function myFunction() {
  authorize();
  init();
  processSheet();
}

function init() {
  spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  sheet = spreadsheet.getSheetByName("ALL");

  assetSheet = getOrCreateAssetSheet();
  service = getArenaService();
  index = 2;
  if (!sheet) {
    throw new Error('Sheet "ALL" not found.');
  }
  clearAndMove();
}

function clearAndMove() {
  sheet.getRange(`${assetIdClmn}:${slugIdClmn}`).clearContent();
  const gg = SpreadsheetApp.getActiveSpreadsheet();
  gg.setActiveSheet(assetSheet);
  gg.moveActiveSheet(gg.getSheets().length);
  gg.setActiveSheet(sheet);
  const range = assetSheet.getDataRange();
  range.setWrap(false);
  range.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  sheet.getRange("U1").setValue("AssetIds");
  sheet.getRange("V1").setValue("SlugIds");
}
//done with helpers
// process sheet
function processSheet() {
  // const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // const sheet = spreadsheet.getSheetByName("ALL");
  if (!sheet) {
    throw new Error('Sheet "Projects" not found.');
  } else {
    Logger.log('Sheet "Projects" found.');
  }

  const service = getArenaService();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    let cell = data[i][2];
    let title_cell = data[i][0];
    sheet.getRange(index, slugIdNum).setValue(SLUG(title_cell));
    extractBlocks(cell, title_cell);
    index++;
  }
}

function handleArena(blockIds, updatedCell) {
  let ids = "";
  blockIds.forEach((id) => {
    const block = fetchArenaBlock(id, service);
    Logger.log("id -->" + id);

    const assetId = "asset_arena_" + id;

    // source urls
    let urlsrc, urlthumb;
    if (block.class == "Attachment") urlsrc = block.attachment?.url ?? "";
    else if (block.class == "Link") urlsrc = block.source.url;
    else urlsrc = block.image?.src ?? block.attachment?.url ?? "";

    // thumbnail url?
    if (block.image && block.image.src) {
      urlthumb = block.image.src;
    } else {
      const contentType = block.attachment?.content_type || null;
      Logger.log("---contenttype: " + contentType);
      if (contentType == "audio/mpeg") urlthumb = audiothumb;
      else if (contentType == "application/pdf") urlthumb = pdfthumb;
    }
    // row generator
    const row = [
      assetId,
      block.title || "",
      urlsrc,
      urlthumb,
      block.description ? block.description.plain : "",
      extractAltText(block),
    ];

    // const sheet = spreadsheet.getSheetByName("ALL");

    Logger.log("upserting asset: " + assetId);
    upsertAsset(assetSheet, row);
    ids += assetId + "\n";
  });
  sheet.getRange(index, assetIdNum).setValue(ids);
}

function handleVideo(videoIds) {
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
  // Logger.log("upserting asset: " + row.thumbnail);
  // const sheet = spreadsheet.getSheetByName("ALL");
  upsertAsset(assetSheet, row);
  sheet.getRange(index, assetIdNum).setValue(assetId);
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

function authCallback(request) {
  const service = getArenaService();

  const authorized = service.handleCallback(request);

  return HtmlService.createHtmlOutput(
    authorized
      ? "Success! You can close this window."
      : "Authorization denied.",
  );
}

function extractBlocks(url, title) {
  if (!url) return [];
  // for are.na
  const arenaRegex = /https?:\/\/(?:www\.)?are\.na\/block\/(\d+)(?=[/?#\s]|$)/;

  const firstUrl = url.trim().split(/\s+/)[0];

  const ytMatch = firstUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([^&?/]+)/,
  );
  // const ytMatch = url.match(
  //   /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([^&?/]+)/,
  // );
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/,
  );

  const lines = url.split(/\r?\n/);

  let ids = [];

  for (const line of lines) {
    const cleanLine = line.trim();

    if (!cleanLine) continue;

    Logger.log("cleanLine: " + cleanLine);
    const match = cleanLine.match(arenaRegex);

    if (match) {
      ids.push(match[1]);
    }
  }
  if (ids.length) {
    handleArena(ids, url);
  }
  if (ytMatch) {
    let vIds = {
      url: url || "",
      title: title || "",
      id: ytMatch[1],
      platform: "yt",
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
    };
    handleVideo(vIds);
  }
  if (vimeoMatch) {
    const thumbnail = getVimeoThumbnail(url);

    let vIds = {
      url: url || "",
      title: title || "",
      id: vimeoMatch[1],
      platform: "vimeo",
      thumbnail: thumbnail, // Vimeo requires an API/oEmbed call
    };
    Logger.log("Vimeo thumbnail: " + thumbnail);
    handleVideo(vIds);
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
  assetSheet ? gg.deleteSheet(assetSheet) : null;
  assetSheet = gg.insertSheet("Assets");
  assetSheet.appendRow([
    "id",
    "title",
    "src",
    "thumbnailURL",
    "description",
    "alt_text",
  ]);

  // gg.setActiveSheet(assetSheet);
  // gg.moveActiveSheet(gg.getSheets().length);
  const range = assetSheet.getDataRange();
  range.setWrap(false);
  range.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  // assetSheet.getDataRange().setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
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

function getVimeoThumbnail(url) {
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
