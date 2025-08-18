
const CLOUD_NAME = "dwpqxbn2q";
const UPLOAD_PRESET = "ml_default";
async function uploadToCloudinary(file){
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(url, { method: "POST", body: form });
  if(!res.ok) throw new Error("Upload failed");
  return await res.json();
}
