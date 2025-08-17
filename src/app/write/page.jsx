'use client';

import Image from 'next/image';
import styles from './writePage.module.css';
import { useEffect, useState } from 'react';
// import 'react-quill/dist/quill.bubble.css';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.bubble.css';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { app } from '@/utils/firebase';

const WritePage = () => {
  const { status } = useSession();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [media, setMedia] = useState('');
  const [value, setValue] = useState('');
  const [title, setTitle] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file selection and upload
  useEffect(() => {
    const upload = async () => {
      try {
        const downloadURL = await uploadToCloudinary(file);
        setMedia(downloadURL);
      } catch (error) {
        console.error('Error uploading file:', error);
        // Handle error (show toast, etc.)
      }
    };

    if (file) {
      upload();
    }
  }, [file]);

  // useEffect(() => {
  //   const storage = getStorage(app);
  //   const upload = () => {
  //     const name = new Date().getTime() + file.name;
  //     const storageRef = ref(storage, name);

  //     const uploadTask = uploadBytesResumable(storageRef, file);

  //     uploadTask.on(
  //       'state_changed',
  //       (snapshot) => {
  //         const progress =
  //           (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //         console.log('Upload is ' + progress + '% done');
  //         switch (snapshot.state) {
  //           case 'paused':
  //             console.log('Upload is paused');
  //             break;
  //           case 'running':
  //             console.log('Upload is running');
  //             break;
  //         }
  //       },
  //       (error) => {},
  //       () => {
  //         getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
  //           setMedia(downloadURL);
  //         });
  //       }
  //     );
  //   };

  //   file && upload();
  // }, [file]);

  // Handle authenticated redirect

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/'); // ✅ client-side navigation
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>You must log in to access this page.</div>;
  }

  const slugify = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  // const handleSubmit = async () => {
  //   const res = await fetch('/api/posts', {
  //     method: 'POST',
  //     body: JSON.stringify({
  //       title,
  //       desc: value,
  //       img: media,
  //       slug: slugify(title),
  //       catSlug: catSlug || 'style', //If not selected, choose the general category
  //     }),
  //   });

  //   if (res.status === 200) {
  //     const data = await res.json();
  //     router.push(`/posts/${data.slug}`);
  //   }
  // };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          desc: value,
          img: media,
          slug: slugify(title),
          catSlug: catSlug || 'style',
        }),
      });

      if (res.status === 200) {
        const data = await res.json();
        router.push(`/posts/${data.slug}`);
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      // Handle error
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Title"
        className={styles.input}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* <div className={styles.editor}>
        <button className={styles.button} onClick={() => setOpen(!open)}>
          <Image src="/plus.png" alt="" width={16} height={16} />
        </button>
        {open && (
          <div className={styles.add}>
            <input
              type="file"
              id="image"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <button className={styles.addButton}>
              <label htmlFor="image">
                <Image src="/image.png" alt="" width={16} height={16} />
              </label>
            </button>
            <button className={styles.addButton}>
              <Image src="/external.png" alt="" width={16} height={16} />
            </button>
            <button className={styles.addButton}>
              <Image src="/video.png" alt="" width={16} height={16} />
            </button>
          </div>
        )}
        <ReactQuill
          className={styles.textArea}
          theme="bubble"
          value={value}
          onChange={setValue}
          placeholder="Tell your story..."
        />
      </div>
      <button className={styles.publish} onClick={handleSubmit}>
        Publish
      </button> */}

      <div className={styles.editor}>
        <button className={styles.button} onClick={() => setOpen(!open)}>
          <Image src="/plus.png" alt="" width={16} height={16} />
        </button>
        {open && (
          <div className={styles.add}>
            <input
              type="file"
              id="image"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'none' }}
              accept="image/*,video/*"
              disabled={uploading}
            />
            <button className={styles.addButton} disabled={uploading}>
              <label
                htmlFor="image"
                style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
              >
                <Image
                  src="/image.png"
                  alt="Upload image"
                  width={16}
                  height={16}
                  style={{ opacity: uploading ? 0.5 : 1 }}
                />
              </label>
            </button>
            <button className={styles.addButton}>
              <Image src="/external.png" alt="" width={16} height={16} />
            </button>
            <button className={styles.addButton}>
              <Image src="/video.png" alt="" width={16} height={16} />
            </button>
          </div>
        )}

        {/* Upload status indicator */}
        {uploading && (
          <div className={styles.uploadStatus}>
            <span>Uploading... Please wait</span>
          </div>
        )}

        {/* Preview uploaded media */}
        {media && (
          <div className={styles.mediaPreview}>
            {media.includes('video') ||
            media.includes('.mp4') ||
            media.includes('.mov') ? (
              <video
                src={media}
                controls
                style={{ maxWidth: '300px', maxHeight: '200px' }}
              />
            ) : (
              <img
                src={media}
                alt="Uploaded media"
                style={{
                  maxWidth: '300px',
                  maxHeight: '200px',
                  objectFit: 'cover',
                }}
              />
            )}
            <button
              className={styles.removeMedia}
              onClick={() => setMedia('')}
              type="button"
            >
              ✕
            </button>
          </div>
        )}

        <ReactQuill
          className={styles.textArea}
          theme="bubble"
          value={value}
          onChange={setValue}
          placeholder="Tell your story..."
        />
      </div>
      <button
        className={styles.publish}
        onClick={handleSubmit}
        disabled={uploading || !title.trim() || !value.trim()}
      >
        {uploading ? 'Uploading...' : 'Publish'}
      </button>
    </div>
  );
};

export default WritePage;
