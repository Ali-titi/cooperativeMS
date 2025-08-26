import { useState, useEffect } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";
import { firebase_auth } from "/firebase.config";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Input from "../Components/AuthComponents/Input";
import Button from "../Components/AuthComponents/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(firebase_auth, email, password);
      if (user) {
        localStorage.setItem('userId', user.uid);
        toast.success("Login Successful");
        navigate("/dashboard");
        console.log(user);
      }
    } catch (error) {
      console.error(error.message);
      if (error.code === "auth/user-not-found")
         toast.error("User not found");
      else if (error.code === "auth/wrong-password")
         toast.error("Wrong password");
      else toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex max-h-screen w-full items-center justify-center mt-12">
      <div className="max-w-md bg-gray-100 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-medium text-center text-gray-600 mb-5">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            icon={<FaUser />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            icon={<FaLock />}
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            label={{ default: "Login", loading: "Logging in..." }}
          />

          <Link
            to="/forgot-password"
            className="text-blue-600 text-xs hover:text-blue-500 transition-colors"
          >
            Forgot password?
          </Link>
        </form>

        <p className="text-center text-xs text-gray-500 mt-3">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            SignUp
          </Link>
        </p>
      </div>
    </div>
  );
}
