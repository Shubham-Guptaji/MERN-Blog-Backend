import Code from "@editorjs/code";
import Delimiter from "@editorjs/delimiter";
import EditorJS from "@editorjs/editorjs";
import Embed from "@editorjs/embed";
import Header from "@editorjs/header";
import Image from "@editorjs/image";
import NestedList from "@editorjs/nested-list";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";
import Raw from "@editorjs/raw";
import SimpleImage from "@editorjs/simple-image";
import Table from "@editorjs/table";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoCloseSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import UploadImg from "../../assets/undraw_add_files_re_v09g.svg";
import Layout from "../../Layout/Layout";
import { createPost, updatePost } from "../../Redux/blogSlice";
import { BlogResource, ResourceUpload } from "../../Redux/resourceSlice";

function PostEditor() {
  const editorHolder = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = useState(true);
  const location = useLocation();
  const { post, userId } = location.state || {};
  const [resourceArr, setResourceArr] = useState([]);
  const [postData, setPostData] = useState({
    id: post ? post._id : null,
    title: post ? post.title : "",
    content: post ? JSON.parse(post.content) : "",
    // content: post ? post.content : "",
    tags: post ? post.tags : [],
    seoKeywords: post ? post.seoKeywords : "",
    metaDescription: post ? post.metaDescription : "",
    url: post ? post.url : "",
    postImage: post ? undefined : null,
    authorId: post ? post?.author?._id : userId ? userId : useSelector((state) => state?.auth?.data?.id),
  });
  const [previewImage, setPreviewImage] = useState("");
  const [data, setData] = useState(post ? post.content : null);
  const [tagValue, setTagValue] = useState("");
  useEffect(() => {
    const editor = new EditorJS({
      holder: editorHolder.current,
      tools: {
        header: {
          class: Header,
          config: {
            placeholder: "Enter a header",
            levels: [2, 3, 4, 5, 6],
            defaultLevel: 3,
          },
        },
        paragraph: Paragraph,
        list: {
          class: NestedList,
          inlineToolbar: true,
          config: {
            defaultStyle: "unordered",
          },
        },
        quote: Quote,
        image: {
          class: Image,
          config: {
            uploader: {
              async uploadByFile(file) {
                const response = await dispatch(ResourceUpload(file));
                if (!response?.payload?.success) {
                  throw new Error("Image upload failed");
                }
                let newId = response?.payload?.data?.id;
                setResourceArr([...resourceArr, newId]);
                return {
                  success: 1,
                  file: {
                    url: response?.payload?.data?.resource_url,
                  },
                };
              },
            },
          },
        },
        simpleImage: SimpleImage,
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              coub: true,
            },
          },
        },
        table: Table,
        delimiter: Delimiter,
        code: Code,
        raw: Raw,
      },
      onReady: async () => {
        console.log("Editor.js is ready");
        if (data && isMounted) {
          await editor.render(JSON.parse(data));
          setData(await editor.save());
          setIsMounted(false);
        }
      },
      onChange: async () => {
        setData(await editor.save());
      },
    });

    if (post && post.public_image?.resource_url) {
      manageImg(post.public_image.resource_url);
    }
  }, [ post]);

  async function manageImg(imageUrl) {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setPreviewImage(url);
  }

  const dataHandler = (event) => {
    setPostData({
      ...postData,
      [event.target.name]: event.target.value,
    });
  };

  const tagHandler = () => {
    if (tagValue === "") return;
    if (postData.tags.length > 12) {
      toast.error("Cannot add more than 12 tags.");
      return;
    }
    setPostData({
      ...postData,
      tags: [...postData.tags, tagValue],
    });
    setTagValue("");
  };

  const getImage = (event) => {
    event.preventDefault();
    const uploadedImage = event.target.files[0];
    if (uploadedImage) {
      setPostData({
        ...postData,
        postImage: uploadedImage,
      });
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setPreviewImage(this.result);
      });
    }
  };

  const postHandler = async (event) => {
    event.preventDefault();
    if (data) postData.content = data;
    if (
      !postData.title ||
      !postData.content ||
      !postData.tags.length ||
      !postData.seoKeywords ||
      !postData.metaDescription ||
      !postData.url ||
      (!postData.postImage && !post)
    ) {
      toast.error("All fields are mandatory!!");
      return;
    }

    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("content", JSON.stringify(postData.content));
    formData.append("tags", JSON.stringify(postData.tags));
    formData.append("seoKeywords", postData.seoKeywords);
    formData.append("metaDescription", postData.metaDescription);
    formData.append("url", postData.url.replace(/\s+/g, "-"));
    formData.append("postImage", postData.postImage);
    formData.append("authorId", postData.authorId);
    let response;
    if (post) {
      let allData = { data: formData, id: postData.id };
      response = await dispatch(updatePost(allData));
    } else {
      response = await dispatch(createPost(formData));
    }

    if (response?.payload?.success) {
      let blogData = {
        id: response.payload.newBlog ? response.payload.newBlog._id : postData.id,
        resources: resourceArr,
      };
      await dispatch(BlogResource(blogData));
      setPostData({
        title: "",
        content: "",
        tags: [],
        seoKeywords: "",
        metaDescription: "",
        url: "",
        postImage: null,
      });
      document.getElementById('editorjs').innerHTML = "";
      navigate("/dashboard");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-2">
        <h1 className="mt-5 text-center text-3xl font-bold text-indigo-600 lg:text-5xl">
          Alcodemy POST Editor
        </h1>
        <input
          type="text"
          name="title"
          value={postData.title}
          className="mb-5 mt-8 w-full border-none px-1 py-3 text-center text-3xl outline-none"
          onChange={dataHandler}
          placeholder="Enter Post Title"
        />
        {!data && (
          <p className="mx-auto mb-3 max-w-7xl text-xl text-gray-700">
            Main Post Content in Box. Click Inside
          </p>
        )}
        <div
          ref={editorHolder}
          className="editor-container mx-auto mb-8 max-w-7xl border-2 border-indigo-700 py-4 lg:px-0 md:px-20 sm:px-14 px-3"
          id="editorjs"
        />
      </div>
      <div className="divider"></div>
      <div className="my-5 px-2">
        <form
          onSubmit={postHandler}
          className="mx-auto flex w-full flex-col items-center gap-2 md:max-w-2xl lg:max-w-4xl xl:max-w-5xl"
        >
          {!previewImage && (
            <span className="mb-5 mt-3 text-xl font-bold">
              Upload Post Image
            </span>
          )}
          <label className="mb-5 cursor-pointer" htmlFor="image_uploads">
            {previewImage ? (
              <img
                className="m-auto h-auto w-full max-w-5xl"
                src={previewImage}
                alt="preview image"
              />
            ) : (
              <img
                src={UploadImg}
                className="m-auto h-auto max-h-48 w-full max-w-3xl"
              />
            )}
          </label>
          <input
            onChange={getImage}
            className="hidden"
            type="file"
            id="image_uploads"
            name="image_uploads"
            accept=".jpg, .jpeg, .png"
          />

          <label className="form-control w-full">
            <div className="label">
              <span className="text-xl">Post Description</span>
            </div>
            <textarea
              className="textarea textarea-bordered"
              placeholder="Post Meta Description"
              name="metaDescription"
              value={postData.metaDescription}
              onChange={dataHandler}
            ></textarea>
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="text-xl">Seo Keywords</span>
            </div>
            <input
              type="text"
              placeholder="Seo Keywords separated by comma"
              className="input input-bordered w-full"
              name="seoKeywords"
              value={postData.seoKeywords}
              onChange={dataHandler}
            />
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="text-xl">Tags</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add Tag Here"
                className="input input-bordered w-full"
                name="tags"
                value={tagValue}
                onChange={(events) => setTagValue(events.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={tagHandler}
                type="button"
              >
                Add
              </button>
            </div>
          </label>
          <div className="mt-3 flex flex-wrap gap-4">
            {postData.tags.map((element) => (
              <div className="indicator" key={element}>
                <span
                  className="badge indicator-item badge-primary cursor-pointer"
                  onClick={() => {
                    setPostData({
                      ...postData,
                      tags: postData.tags.filter((item) => item !== element),
                    });
                  }}
                >
                  <IoCloseSharp />
                </span>
                <span className="grid place-items-center rounded-full p-3 pb-2 pt-2 text-center text-indigo-600 ring-2">
                  {element}
                </span>
              </div>
            ))}
          </div>
          <label className="form-control w-full">
            <div className="label">
              <span className="text-xl">Site Url</span>
            </div>
            {post ? (
              <p
                className="px-3 py-4 rounded-md border-2 text-md w-full "
                onClick={() => toast.error("Can't change Post Url.")}
              >
                {postData.url}
              </p>
            ) : (
              <input
                type="text"
                placeholder="Enter your unique url"
                className="input input-bordered w-full"
                name="url"
                value={postData.url}
                onChange={dataHandler}
              />
            )}
          </label>
          <button
            className="btn btn-primary mx-auto mb-5 mt-8 w-full max-w-xs"
            type="submit"
          >
            {post ? "Update Post" : "Post"}
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default PostEditor;
