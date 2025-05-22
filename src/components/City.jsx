// import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// import styles from "./City.module.css";
// import { useCities } from "../context/citiesContext";
// import { useEffect } from "react";
// import Button from "./Button";
// import Spinner from "./Spinner";

// const formatDate = (date) =>
//   new Intl.DateTimeFormat("en", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//     weekday: "long",
//   }).format(new Date(date));

// function City() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { currentCity, getCity, isLoading } = useCities();
//   const { cityName, emoji, date, notes } = currentCity;

//   useEffect(
//     function () {
//       getCity(id);
//     },
//     [currentCity.id]
//   );

//   if (isLoading) return <Spinner />;

//   return (
//     <div className={styles.city}>
//       <div className={styles.row}>
//         <h6>City name</h6>
//         <h3>
//           {/* <span>{emoji}</span> {cityName} */}
//           <div>
//             <img
//               src={`https://flagcdn.com/24x18/${emoji.toLowerCase()}.png`}
//               alt={`Flag of ${emoji.toUpperCase()}`}
//               className={styles.emoji}
//               style={{ width: "24px", height: "18px", marginRight: "0.5rem" }}
//             />
//             <span>{cityName}</span>
//           </div>
//         </h3>
//       </div>

//       <div className={styles.row}>
//         <h6>You went to {cityName} on</h6>
//         <p>{formatDate(date || null)}</p>
//       </div>

//       {notes && (
//         <div className={styles.row}>
//           <h6>Your notes</h6>
//           <p>{notes}</p>
//         </div>
//       )}

//       <div className={styles.row}>
//         <h6>Learn more</h6>
//         <a
//           href={`https://en.wikipedia.org/wiki/${cityName}`}
//           target="_blank"
//           rel="noreferrer"
//         >
//           Check out {cityName} on Wikipedia &rarr;
//         </a>
//       </div>

//       <div>
//         <Button
//           type="back"
//           onClick={() => {
//             navigate(-1);
//           }}
//         >
//           &larr; Back
//         </Button>{" "}
//       </div>
//     </div>
//   );
// }

// export default City;
import { useNavigate, useParams } from "react-router-dom";
import styles from "./City.module.css";
import { useCities } from "../context/CitiesContext";
import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import Spinner from "./Spinner";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(date));

function City() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCity, getCity, isLoading, updateCity } = useCities();

  // Fix 1: Move this destructuring after the loading check
  // const { cityName, emoji, date, notes } = currentCity;

  useEffect(
    function () {
      getCity(id);
    },
    [id, getCity] // Fix 2: Use proper dependency array - id and getCity only
  );

  // async function handleImageUpload(e) {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   setIsUploading(true);

  //   try {
  //     // Client-side only solution: Convert image to base64
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);

  //     reader.onload = async () => {
  //       const base64Image = reader.result;
  //       // Update city with the base64 image data
  //       await updateCity(id, { image: base64Image });
  //     };

  //     reader.onerror = () => {
  //       throw new Error("Failed to read image file");
  //     };
  //   } catch (err) {
  //     console.error("Error uploading image:", err);
  //     alert("Error uploading image");
  //   } finally {
  //     setIsUploading(false);
  //   }
  // }
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image size (e.g., max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      alert("Image must be smaller than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Resize and compress image before conversion
      const optimizedImage = await resizeImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.7,
        fileType: "image/jpeg",
      });

      const base64Image = await convertToBase64(optimizedImage);
      await updateCity(id, { image: base64Image });
    } catch (err) {
      console.error("Error processing image:", err);
      alert("Error processing image");
    } finally {
      setIsUploading(false);
    }
  }

  // Helper function to resize images
  function resizeImage(file, options) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > options.maxWidth) {
            height *= options.maxWidth / width;
            width = options.maxWidth;
          }
          if (height > options.maxHeight) {
            width *= options.maxHeight / height;
            height = options.maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => resolve(blob),
            options.fileType,
            options.quality
          );
        };
      };
      reader.readAsDataURL(file);
    });
  }

  // Helper function to convert to Base64
  function convertToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function handleDeleteImage() {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    try {
      await updateCity(id, { image: null });
    } catch (err) {
      console.error("Error deleting image:", err);
      alert("Error deleting image");
    }
  }

  // Fix 3: Check for loading state first
  if (isLoading) return <Spinner />;

  // Fix 4: Check if currentCity has data before rendering content
  if (!currentCity || Object.keys(currentCity).length === 0) {
    return <Spinner />;
  }

  // Fix 5: Only destructure after we've checked currentCity exists
  const { cityName, emoji, date, notes, image } = currentCity;

  return (
    <div className={styles.city}>
      <div className={styles.row}>
        <h6>City name</h6>
        <h3>
          <div>
            {/* Fix 6: Add conditional rendering for the emoji image */}
            {emoji && (
              <img
                src={`https://flagcdn.com/24x18/${emoji.toLowerCase()}.png`}
                alt={`Flag of ${emoji.toUpperCase()}`}
                className={styles.emoji}
                style={{ width: "24px", height: "18px", marginRight: "0.5rem" }}
              />
            )}
            <span>{cityName}</span>
          </div>
        </h3>
      </div>

      <div className={styles.row}>
        <h6>You went to {cityName} on</h6>
        <p>{formatDate(date || null)}</p>
      </div>

      {notes && (
        <div className={styles.row}>
          <h6>Your notes</h6>
          <p>{notes}</p>
        </div>
      )}

      <div className={styles.row}>
        <h6>Snapshop</h6>
        {image ? (
          <div className={styles.imageContainer}>
            <img src={image} alt={`${cityName}`} className={styles.cityImage} />
            <button
              onClick={() => fileInputRef.current.click()}
              className={styles.changeImageButton}
            >
              Change Image
            </button>
            <button
              onClick={handleDeleteImage}
              className={styles.deleteButton} // Only apply deleteButton class
            >
              Delete Image
            </button>
          </div>
        ) : (
          <div className={styles.uploadContainer}>
            <input
              type="file"
              id="cityImage"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className={styles.primary} // Use the .primary class
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload a memory"}
            </button>
          </div>
        )}
      </div>

      <div className={styles.row}>
        <h6>Learn more</h6>
        <a
          href={`https://en.wikipedia.org/wiki/${cityName}`}
          target="_blank"
          rel="noreferrer"
          className={styles.externalLink}
        >
          Check out {cityName} on Wikipedia &rarr;
        </a>
      </div>

      <div>
        <Button
          type="back"
          onClick={() => {
            navigate(-1);
          }}
        >
          &larr; Back
        </Button>{" "}
      </div>
    </div>
  );
}

export default City;
