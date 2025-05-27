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

//before deepseek
// export default City;
// import { useNavigate, useParams } from "react-router-dom";
// import { useCities } from "../context/CitiesContext";
// import { useEffect, useRef, useState } from "react";
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
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { currentCity, getCity, isLoading, updateCity } = useCities();

//   // Fix 1: Move this destructuring after the loading check
//   // const { cityName, emoji, date, notes } = currentCity;

//   useEffect(
//     function () {
//       getCity(id);
//     },
//     [id, getCity] // Fix 2: Use proper dependency array - id and getCity only
//   );

//   // async function handleImageUpload(e) {
//   //   const file = e.target.files[0];
//   //   if (!file) return;

//   //   setIsUploading(true);

//   //   try {
//   //     // Client-side only solution: Convert image to base64
//   //     const reader = new FileReader();
//   //     reader.readAsDataURL(file);

//   //     reader.onload = async () => {
//   //       const base64Image = reader.result;
//   //       // Update city with the base64 image data
//   //       await updateCity(id, { image: base64Image });
//   //     };

//   //     reader.onerror = () => {
//   //       throw new Error("Failed to read image file");
//   //     };
//   //   } catch (err) {
//   //     console.error("Error uploading image:", err);
//   //     alert("Error uploading image");
//   //   } finally {
//   //     setIsUploading(false);
//   //   }
//   // }
//   async function handleImageUpload(e) {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Validate image size (e.g., max 5MB)
//     const MAX_SIZE = 5 * 1024 * 1024; // 5MB
//     if (file.size > MAX_SIZE) {
//       alert("Image must be smaller than 5MB");
//       return;
//     }

//     setIsUploading(true);

//     try {
//       // Resize and compress image before conversion
//       const optimizedImage = await resizeImage(file, {
//         maxWidth: 400,
//         maxHeight: 400,
//         quality: 0.7,
//         fileType: "image/jpeg",
//       });

//       const base64Image = await convertToBase64(optimizedImage);
//       await updateCity(id, { image: base64Image });
//     } catch (err) {
//       console.error("Error processing image:", err);
//       alert("Error processing image");
//     } finally {
//       setIsUploading(false);
//     }
//   }

//   // Helper function to resize images
//   function resizeImage(file, options) {
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onload = (event) => {
//         const img = new Image();
//         img.src = event.target.result;

//         img.onload = () => {
//           const canvas = document.createElement("canvas");
//           let width = img.width;
//           let height = img.height;

//           // Calculate new dimensions while maintaining aspect ratio
//           if (width > options.maxWidth) {
//             height *= options.maxWidth / width;
//             width = options.maxWidth;
//           }
//           if (height > options.maxHeight) {
//             width *= options.maxHeight / height;
//             height = options.maxHeight;
//           }

//           canvas.width = width;
//           canvas.height = height;

//           const ctx = canvas.getContext("2d");
//           ctx.drawImage(img, 0, 0, width, height);

//           canvas.toBlob(
//             (blob) => resolve(blob),
//             options.fileType,
//             options.quality
//           );
//         };
//       };
//       reader.readAsDataURL(file);
//     });
//   }

//   // Helper function to convert to Base64
//   function convertToBase64(blob) {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   }

//   async function handleDeleteImage() {
//     if (!window.confirm("Are you sure you want to delete this image?")) return;

//     try {
//       await updateCity(id, { image: null });
//     } catch (err) {
//       console.error("Error deleting image:", err);
//       alert("Error deleting image");
//     }
//   }

//   // Fix 3: Check for loading state first
//   if (isLoading) return <Spinner />;

//   // Fix 4: Check if currentCity has data before rendering content
//   if (!currentCity || Object.keys(currentCity).length === 0) {
//     return <Spinner />;
//   }

//   // Fix 5: Only destructure after we've checked currentCity exists
//   const { cityName, emoji, date, notes, image } = currentCity;

//   return (
//     <div className="p-8 max-h-[70%] bg-dark-2 rounded-lg overflow-auto w-full flex flex-col gap-8 scrollbar-thin scrollbar-thumb-brand-2 scrollbar-track-dark-1">
//       <div className="flex flex-col gap-2">
//         <h6 className="uppercase text-xs font-extrabold text-light-1">
//           City name
//         </h6>
//         <h3 className="text-2xl md:text-3xl flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             {emoji && (
//               <img
//                 src={`https://flagcdn.com/24x18/${emoji.toLowerCase()}.png`}
//                 alt={`Flag of ${emoji.toUpperCase()}`}
//                 className="inline-block align-middle"
//                 style={{ width: "24px", height: "18px", marginRight: "0.5rem" }}
//               />
//             )}
//             <span className="text-3xl md:text-4xl font-bold leading-none">
//               {cityName}
//             </span>
//           </div>
//         </h3>
//       </div>
//       <div className="flex flex-col gap-2">
//         <h6 className="uppercase text-xs font-extrabold text-light-1">
//           You went to {cityName} on
//         </h6>
//         <p className="text-base md:text-lg">{formatDate(date || null)}</p>
//       </div>
//       {notes && (
//         <div className="flex flex-col gap-2">
//           <h6 className="uppercase text-xs font-extrabold text-light-1">
//             Your notes
//           </h6>
//           <p className="text-base md:text-lg">{notes}</p>
//         </div>
//       )}
//       <div className="flex flex-col gap-2">
//         <h6 className="uppercase text-xs font-extrabold text-light-1">
//           Snapshot
//         </h6>
//         {image ? (
//           <div className="relative w-full rounded-lg overflow-hidden flex flex-col gap-4 items-center">
//             <img
//               src={image}
//               alt={`${cityName}`}
//               className="w-full h-auto rounded-lg object-cover max-h-[30rem]"
//             />
//             <button
//               onClick={() => fileInputRef.current.click()}
//               className="bg-dark-1 text-light-2 border border-dark-0 px-4 py-2 rounded font-semibold uppercase transition-all min-w-[10rem] hover:bg-dark-0 focus:bg-dark-0"
//             >
//               Change Image
//             </button>
//             <button
//               onClick={handleDeleteImage}
//               className="bg-red-600 border border-red-800 text-white px-4 py-2 rounded font-semibold uppercase transition-all min-w-[10rem] hover:bg-red-800 focus:bg-red-800"
//             >
//               Delete Image
//             </button>
//           </div>
//         ) : (
//           <div className="flex justify-center p-4 w-full">
//             <input
//               type="file"
//               id="cityImage"
//               ref={fileInputRef}
//               accept="image/*"
//               onChange={handleImageUpload}
//               disabled={isUploading}
//               style={{ display: "none" }}
//             />
//             <button
//               onClick={() => fileInputRef.current.click()}
//               className="bg-brand-2 text-dark-0 px-6 py-2 rounded-lg font-bold uppercase transition-all min-w-[15rem] hover:bg-green-600 focus:bg-green-600 disabled:bg-dark-0 disabled:text-light-1"
//               disabled={isUploading}
//             >
//               {isUploading ? "Uploading..." : "Upload a memory"}
//             </button>
//           </div>
//         )}
//       </div>
//       <div className="flex flex-col gap-2">
//         <h6 className="uppercase text-xs font-extrabold text-light-1">
//           Learn more
//         </h6>
//         <a
//           href={`https://en.wikipedia.org/wiki/${cityName}`}
//           target="_blank"
//           rel="noreferrer"
//           className="text-base md:text-lg text-brand-1 font-semibold inline-flex items-center gap-2 transition-colors hover:text-brand-2 hover:underline focus:underline focus:text-brand-2"
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
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default City;

//afterDeep
// export default City;
import { useNavigate, useParams } from "react-router-dom";
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

  useEffect(() => {
    getCity(id);
  }, [id, getCity]);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      alert("Image must be smaller than 5MB");
      return;
    }

    setIsUploading(true);

    try {
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

  if (isLoading) return <Spinner />;

  if (!currentCity || Object.keys(currentCity).length === 0) {
    return <Spinner />;
  }

  const { cityName, emoji, date, notes, image } = currentCity;

  return (
    <div className="w-full max-w-4xl mx-auto font-manrope">
      {/* Header Section */}
      <div
        className="bg-gradient-to-br from-dark-2 to-dark-1 rounded-2xl 
                     shadow-2xl border border-dark-2/50 overflow-hidden"
      >
        {/* City Header */}
        <div
          className="bg-gradient-to-r from-brand-1/10 to-brand-2/10 
                       px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 
                       border-b border-dark-2/30"
        >
          <div className="flex flex-col gap-6">
            {/* City Name Section */}
            <div className="flex flex-col gap-3">
              <h6
                className="uppercase text-xs sm:text-sm font-extrabold 
                           text-light-1 tracking-wider"
              >
                City name
              </h6>
              <div className="flex items-center gap-4 flex-wrap">
                {/* Flag */}
                <div
                  className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 
                               bg-gradient-to-br from-light-2/10 to-light-2/5 
                               rounded-xl border border-light-2/20 
                               flex items-center justify-center shadow-lg"
                >
                  <img
                    src={`https://flagcdn.com/48x36/${emoji.toLowerCase()}.png`}
                    alt={`Flag of ${emoji.toUpperCase()}`}
                    className="w-8 h-6 sm:w-10 sm:h-8 object-cover rounded shadow-sm"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "inline";
                    }}
                  />
                  <span className="text-2xl sm:text-3xl hidden">{emoji}</span>
                </div>

                {/* City Name */}
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl 
                              font-bold text-light-2 leading-tight"
                >
                  {cityName}
                </h1>
              </div>
            </div>

            {/* Visit Date */}
            <div className="flex flex-col gap-3">
              <h6
                className="uppercase text-xs sm:text-sm font-extrabold 
                           text-light-1 tracking-wider"
              >
                You went to {cityName} on
              </h6>
              <p className="text-base sm:text-lg md:text-xl text-light-2 font-medium">
                {formatDate(date || new Date())}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 md:p-10 space-y-8 sm:space-y-10">
          {/* Notes Section */}
          {notes && (
            <div className="bg-dark-2/50 rounded-xl p-6 border border-dark-2/30">
              <h6
                className="uppercase text-xs sm:text-sm font-extrabold 
                           text-light-1 tracking-wider mb-4"
              >
                Your notes
              </h6>
              <div className="bg-dark-1/30 rounded-lg p-4 border-l-4 border-brand-2">
                <p
                  className="text-sm sm:text-base md:text-lg text-light-2 
                             leading-relaxed whitespace-pre-wrap"
                >
                  {notes}
                </p>
              </div>
            </div>
          )}

          {/* Image/Snapshot Section */}
          <div className="space-y-4">
            <h6
              className="uppercase text-xs sm:text-sm font-extrabold 
                         text-light-1 tracking-wider"
            >
              Memory Snapshot
            </h6>

            {image ? (
              <div className="space-y-6">
                {/* Image Display */}
                <div
                  className="relative rounded-xl overflow-hidden 
                               shadow-2xl border border-dark-2/30"
                >
                  <img
                    src={image}
                    alt={`Memory from ${cityName}`}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t 
                                 from-dark-0/20 to-transparent"
                  ></div>
                </div>

                {/* Image Controls */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="flex-1 bg-gradient-to-r from-brand-2 to-brand-2/90 
                             text-dark-0 px-6 py-3 rounded-xl font-bold 
                             uppercase transition-all duration-300 
                             hover:from-brand-2/90 hover:to-brand-2 
                             hover:scale-105 hover:shadow-lg hover:shadow-brand-2/20
                             focus:outline-none focus:ring-2 focus:ring-brand-2
                             text-sm sm:text-base"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={handleDeleteImage}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 
                             text-white px-6 py-3 rounded-xl font-bold 
                             uppercase transition-all duration-300 
                             hover:from-red-700 hover:to-red-800 
                             hover:scale-105 hover:shadow-lg hover:shadow-red-500/20
                             focus:outline-none focus:ring-2 focus:ring-red-500
                             text-sm sm:text-base"
                  >
                    Delete Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-dark-2/50 
                             rounded-xl p-8 sm:p-12 text-center
                             bg-gradient-to-br from-dark-2/20 to-dark-1/20"
              >
                <div className="space-y-4">
                  <div className="text-4xl sm:text-5xl opacity-50">📸</div>
                  <p className="text-light-1/70 text-sm sm:text-base mb-6">
                    No memory uploaded yet. Add a photo to remember this moment!
                  </p>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-brand-2 to-brand-1 
                             text-dark-0 px-8 py-4 rounded-xl font-bold 
                             uppercase transition-all duration-300 
                             hover:from-brand-1 hover:to-brand-2 
                             hover:scale-105 hover:shadow-lg hover:shadow-brand-2/20
                             focus:outline-none focus:ring-2 focus:ring-brand-2
                             disabled:opacity-50 disabled:cursor-not-allowed
                             disabled:hover:scale-100 disabled:hover:shadow-none
                             text-sm sm:text-base min-w-48"
                  >
                    {isUploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div
                          className="w-4 h-4 border-2 border-dark-0/30 
                                       border-t-dark-0 rounded-full animate-spin"
                        ></div>
                        Uploading...
                      </span>
                    ) : (
                      "Upload a Memory"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
          </div>

          {/* Wikipedia Link */}
          <div className="bg-dark-2/30 rounded-xl p-6 border border-dark-2/30">
            <h6
              className="uppercase text-xs sm:text-sm font-extrabold 
                         text-light-1 tracking-wider mb-4"
            >
              Learn more
            </h6>
            <a
              href={`https://en.wikipedia.org/wiki/${cityName}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 text-base sm:text-lg 
                       text-brand-1 font-semibold transition-all duration-300 
                       hover:text-brand-2 hover:gap-4 group"
            >
              <span>Check out {cityName} on Wikipedia</span>
              <span
                className="transition-transform duration-300 
                             group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </a>
          </div>

          {/* Back Button */}
          <div className="p-4">
            <button
              type=""
              onClick={() => navigate(-1)}
              className="bg-dark-1 hover:bg-brand-2 text-light-2 hover:text-dark-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-brand-1/60 hover:border-brand-2 shadow-md"
            >
              &larr; Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default City;
