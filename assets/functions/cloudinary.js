import Axios from 'axios'

const CLOUDINARY_CLOUD_NAME = 'varsitytutorshome'
const CLOUDINARY_UPLOAD_PRESET = 'versity'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

export const uploadImageToCloudinary = async (asset) => {
    const data = new FormData()
    data.append('file', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `photo_${Math.round(Math.random() * 1e9)}.jpg`,
    })
    data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    data.append('cloud_name', CLOUDINARY_CLOUD_NAME)

    const res = await Axios.post(CLOUDINARY_UPLOAD_URL, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return { url: res.data.secure_url || res.data.url, publicId: res.data.public_id }
}
