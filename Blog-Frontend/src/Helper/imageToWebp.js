// Component to convert image format to webp
export default function convertUrl(url) {
    try {
        // Regular expression to match image URLs
        const regex = /(https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(v\d+\/.+\.(jpg|jpeg|png))/i;
      
        // Replace the matched part with 'f_webp/' inserted
        const convertedUrl = url.replace(regex, '$1f_webp/$2');
        return convertedUrl;
    } catch (error) {
        return url
    }
  }