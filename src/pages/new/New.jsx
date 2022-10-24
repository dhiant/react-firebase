import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const New = ({ inputs, title, form }) => {
  const [file, setFile] = useState("");
  const [formData, setFormData] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const uploadFile = () => {
      const fileUniqueName = new Date().getTime() + file.name;
      console.log(fileUniqueName);
      const storageRef = ref(storage, fileUniqueName);

      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setIsButtonDisabled(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
            default:
              break;
          }
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFormData((prevformData) => ({
              ...prevformData,
              img: downloadURL,
            }));
            // console.log("File available at", downloadURL);
          });
        }
      );
    };

    file && uploadFile();
  }, [file]);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form === "user") {
      // put asynchronous code inside try/catch block
      try {
        const response = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        // the id passed here comes from firebase response
        await setDoc(doc(db, "users", response.user.uid), {
          ...formData,
        });
        navigate(-1);
      } catch (error) {
        console.log(error);
      }
    }
    if (form === "product") {
      try {
        await addDoc(collection(db, "products"), formData);
      } catch (err) {
        console.log(err);
      }
      navigate(-1);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
            />
          </div>
          <div className="right">
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    onChange={handleInput}
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={isButtonDisabled === null || isButtonDisabled < 100}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
