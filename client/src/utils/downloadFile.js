function extractNameFromUrl(url) {
  try {
    const parsed = new URL(url);
    const pathName = parsed.pathname || "";
    const rawName = pathName.substring(pathName.lastIndexOf("/") + 1);
    return decodeURIComponent(rawName || "");
  } catch {
    return "";
  }
}

export function getDownloadFileName(file, fallback = "download") {
  const preferredName = (file?.name || "").trim();
  if (preferredName) return preferredName;

  const nameFromUrl = extractNameFromUrl(file?.url || "");
  if (nameFromUrl) return nameFromUrl;

  return fallback;
}

export async function downloadFileWithName(file, fallback = "download") {
  if (!file?.url) return;

  const fileName = getDownloadFileName(file, fallback);

  try {
    const response = await fetch(file.url);
    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(objectUrl);
  } catch {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
