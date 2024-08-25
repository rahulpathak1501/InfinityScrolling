import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { parseLinkHeader } from "./perseLinkHeader";

const LIMIT = 50;

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const nextPhotoUrlRef = useRef();

  const fetchPhotos = async (url, { overWrite = false } = {}) => {
    setIsLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 5000));
      const response = await axios.get(url);
      const data = await response.data;
      nextPhotoUrlRef.current = parseLinkHeader(
        response.headers.get("LINK")
      ).next;
      if (overWrite) {
        setPhotos(data);
      } else {
        setPhotos((prevPhotos) => {
          return [...prevPhotos, ...data];
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos(
      `http://localhost:3000/photos-short-list?_page=1&_limit=${LIMIT}`,
      {
        overWrite: true,
      }
    );
  }, []);

  const imageRef = useCallback((image) => {
    if (image === null || !nextPhotoUrlRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchPhotos(nextPhotoUrlRef.current);
        observer.unobserve(image);
      }
    });

    observer.observe(image);
  }, []);

  return (
    <div className="grid">
      {photos &&
        photos.map((image, index) => (
          <img
            src={image.url}
            alt={`image-${image.id}`}
            key={image.id}
            ref={index === photos.length - 1 ? imageRef : undefined}
          />
        ))}
      {isLoading &&
        Array.from({ length: LIMIT }, (_, index) => index).map((n) => {
          return (
            <div key={n} className="skeleton">
              Loading...
            </div>
          );
        })}
    </div>
  );
}
