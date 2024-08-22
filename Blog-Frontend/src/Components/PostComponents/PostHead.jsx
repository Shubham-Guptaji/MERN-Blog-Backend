import { Helmet } from "react-helmet"

const PostHead = ({ postDetails, url }) => {
  // Define the helmet component which is used to handle document head elements
  return (
    <Helmet>
      {/* Set the og:image meta tag with the post's public image resource url */}
      <meta property="og:image" content={postDetails?.public_image?.resource_url} />
      {/* Set the description meta tag with the post's metaDescription */}
      <meta name="description" content={postDetails?.metaDescription} />
      {/* Set the title tag with the post's title */}
      <meta name="title" content={postDetails?.title} />
      {/* Set the title of the page */}
      <title>{postDetails?.title}</title>
      {/* Set the favicon */}
      <link rel="icon" type="image/x-icon" href="/Alcodemy.png" />

      {/* Set the og:type meta tag with the value 'website' */}
      <meta property="og:type" content="website" />
      {/* Set the og:url meta tag with the post's url */}
      <meta property="og:url" content={`https://blog.alcodemy.tech/posts/${url}`} />
      {/* Set the og:title meta tag with the post's title */}
      <meta property="og:title" content={postDetails?.title} />
      {/* Set the og:description meta tag with the post's metaDescription */}
      <meta property="og:description" content={postDetails?.metaDescription} />
      {/* Set the keywords meta tag with the post's seoKeywords */}
      <meta name="keywords" content={`${postDetails.seoKeywords}`} />

      {/* Set the twitter:card meta tag with the value 'Alcodemy Blog' */}
      <meta property="twitter:card" content="Alcodemy Blog" />
      {/* Set the twitter:url meta tag with the post's url */}
      <meta property="twitter:url" content={`https://blog.alcodemy.tech/posts/${url}`} />
      {/* Set the twitter:title meta tag with the post's title */}
      <meta property="twitter:title" content={postDetails?.title} />
      {/* Set the twitter:description meta tag with the post's metaDescription */}
      <meta property="twitter:description" content={postDetails?.metaDescription} />
      {/* Set the twitter:image meta tag with the post's public image resource url */}
      <meta property="twitter:image" content={postDetails?.public_image?.resource_url} />
    </Helmet>
  )
}

export default PostHead;