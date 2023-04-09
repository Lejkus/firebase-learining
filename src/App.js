import { useEffect, useState, useTransition } from "react";
import "./App.css";
import { Auth } from "./components/auth";
import { db, auth, storage } from "./config/firebase";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [isPending, startTransition] = useTransition();
  const [currentUser, setCurrentUser] = useState(null);
  const [movieList, setMovieList] = useState([]);

  // New Movie States
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newReleaseDate, setNewReleaseDate] = useState(0);
  const [isNewMovieOscar, setIsNewMovieOscar] = useState(false);

  // Update Title State
  const [updatedTitle, setUpdatedTitle] = useState("");

  // File Upload State
  const [fileUpload, setFileUpload] = useState(null);

  //file Read State

  const moviesCollectionRef = collection(db, "movies");

  const getMovieList = async () => {
    try {
      // const data = await getDocs(moviesCollectionRef);
      const data = await getDocs(
        query(moviesCollectionRef, where("userId", "==", currentUser.uid))
      );
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setImagesToMovie(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  const setImagesToMovie = async (movies) => {
    setMovieList([]);
    const newMovies = await Promise.all(
      movies.map(async (movie) => {
        const images = await getPhotosList(movie.id);
        return {
          ...movie,
          images: images,
        };
      })
    );
    setMovieList(newMovies);
  };

  const getPhotosList = async (id) => {
    const imagesListRef = ref(storage, `${id}/`);
    const images = await listAll(imagesListRef);
    const urls = await Promise.all(
      images.items.reverse().map(async (item) => {
        const url = await getDownloadURL(item);
        return url;
      })
    );
    return urls;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      getMovieList();
    }else{
      setMovieList([]);
    }
    
  }, [currentUser]);

  const onSubmitMovie = async () => {
    try {
      await addDoc(moviesCollectionRef, {
        title: newMovieTitle,
        releaseDate: newReleaseDate,
        receivedAnOscar: isNewMovieOscar,
        userId: auth?.currentUser?.uid,
      });
      getMovieList();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMovie = async (id) => {
    const movieDoc = doc(db, "movies", id);
    const folderRef = ref(storage, `${id}/`);

    try {
      const folderItems = await listAll(folderRef);
      await Promise.all(
        folderItems.items.map(async (itemRef) => {
          await deleteObject(itemRef);
        })
      );

      await deleteDoc(movieDoc);
    } catch (error) {
      console.log(error);
    }
    getMovieList();
  };

  const updateMovieTitle = async (id) => {
    const movieDoc = doc(db, "movies", id);
    await updateDoc(movieDoc, { title: updatedTitle });
    startTransition(() => {
      getMovieList();
    });
    // getMovieList();
  };

  const uploadFile = async (id) => {
    if (!fileUpload) return;
    const filesFolderRef = ref(storage, `${id}/${fileUpload.name}`);
    try {
      await uploadBytes(filesFolderRef, fileUpload);
      getMovieList();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="App">
      <Auth />
      <hr></hr>
      <div>
        <input
          placeholder="Movie title..."
          onChange={(e) => setNewMovieTitle(e.target.value)}
        />
        <input
          placeholder="Release Date..."
          type="number"
          onChange={(e) => setNewReleaseDate(Number(e.target.value))}
        />
        <input
          type="checkbox"
          checked={isNewMovieOscar}
          onChange={(e) => setIsNewMovieOscar(e.target.checked)}
        />
        <label> Received an Oscar</label>

        <button onClick={onSubmitMovie}> Submit Movie</button>
      </div>
      <hr></hr>
      <div>
        {movieList.map((movie, i) => (
          <div key={i}>
            <h1 style={{ color: movie.receivedAnOscar ? "green" : "red" }}>
              {movie.title}
            </h1>
            <img
              style={{ width: "300px", height: "400px" }}
              src={movie.images[0]}
            ></img>

            <p> Date: {movie.releaseDate} </p>

            <button onClick={() => deleteMovie(movie.id)}> Delete Movie</button>

            <input
              placeholder="new title..."
              onChange={(e) => setUpdatedTitle(e.target.value)}
            />
            <button onClick={() => updateMovieTitle(movie.id)}>
              {" "}
              Update Title
            </button>
            <div>
              <input
                type="file"
                onChange={(e) => setFileUpload(e.target.files[0])}
              />
              <button onClick={(e) => uploadFile(movie.id)}>
                {" "}
                Upload File{" "}
              </button>
            </div>
          </div>
        ))}
      </div>
      <hr></hr>

      <hr></hr>
      {/* {imageUrls.map((url) => {
        return <img src={url} style={{ width: "400px" }} />;
      })} */}
    </div>
  );
}

export default App;
