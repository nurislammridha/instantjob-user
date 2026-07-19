const CLOUDINARY_CLOUD_NAME = 'varsitytutorshome';
const CLOUDINARY_UPLOAD_PRESET = 'versity';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Use React Native's built-in fetch rather than axios for this upload.
// axios 1.6.x on React Native is known to throw a bare "Network Error" on
// multipart FormData file uploads; RN's fetch handles the {uri,type,name}
// file part + multipart boundary correctly.
export const uploadImageToCloudinary = async (asset) => {
    const data = new FormData();
    data.append('file', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `photo_${Date.now()}.jpg`,
    });
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    data.append('cloud_name', CLOUDINARY_CLOUD_NAME);

    // Do NOT set Content-Type manually: fetch generates it with the multipart boundary.
    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: data,
    });

    const json = await res.json();
    if (!res.ok) {
        throw new Error(json?.error?.message || 'Cloudinary upload failed');
    }
    return { url: json.secure_url || json.url, publicId: json.public_id };
};
