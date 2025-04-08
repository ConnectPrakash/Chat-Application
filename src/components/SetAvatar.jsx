import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";

export default function SetAvatar() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    const checkUser = () => {
      const user = localStorage.getItem("chat-app-user");
      if (!user) navigate("/login");
    };
    checkUser();
  }, [navigate]);

  const fetchAvatars = useCallback(async () => {
    try {
      const promises = Array.from({ length: 4 }, async () => {
        const randomId = Math.floor(Math.random() * 1000);
        const res = await axios.get(
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomId}`,
          { responseType: "text" }
        );
  
        // Proper Base64 encoding for UTF-8 SVG using a browser-safe method
        const base64Avatar = btoa(unescape(encodeURIComponent(res.data)));
        return base64Avatar;
      });
  
      const results = await Promise.all(promises);
      setAvatars(results);
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Failed to fetch avatars:", error);
      toast.error("Failed to fetch avatars. Please try again.", toastOptions);
      setIsLoading(false);
    }
  }, []);
  
  

  useEffect(() => {
    fetchAvatars();
  }, [fetchAvatars]);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("chat-app-user"));

      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selectedAvatar],
      });

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem("chat-app-user", JSON.stringify(user));
        navigate("/");
      } else {
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    } catch (err) {
      console.error("❌ Error setting avatar:", err);
      toast.error("Something went wrong. Please try again.", toastOptions);
    }
  };

  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="Loading..." className="loader" />
          <h3 style={{ color: "white" }}>Loading avatars...</h3>
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an Avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className={`avatar ${selectedAvatar === index ? "selected" : ""}`}
                onClick={() => setSelectedAvatar(index)}
              >
                <img
                  src={`data:image/svg+xml;base64,${avatar}`}
                  alt={`Avatar ${index + 1}`}
                />
              </div>
            ))}
          </div>
          <button onClick={setProfilePicture} className="submit-btn">
            Set as Profile Picture
          </button>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    h1 {
      color: white;
    }
  }

  .avatars {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.3s ease-in-out;
      cursor: pointer;

      img {
        height: 6rem;
        transition: 0.3s ease-in-out;
      }

      &:hover {
        border-color: #4e0eff;
      }
    }

    .selected {
      border-color: #4e0eff;
    }
  }

  .submit-btn {
    background-color: #4e0eff;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    transition: background 0.3s;

    &:hover {
      background-color: #3a00d4;
    }
  }
`;
