import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { firebase_auth } from "/firebase.config";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Input from "../Components/AuthComponents/Input";
import Button from "../Components/AuthComponents/Button";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(firebase_auth, email, password);
      if (user) {
        toast.success("Account Created!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error during registration:", error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex max-h-screen w-full items-center justify-center mt-12">
      <div className="max-w-md bg-gray-100 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-medium text-center text-gray-600 mb-5">Create Account</h2>

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

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            icon={<FaLock />}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition">
              { isLoading? "Signing up...":"Sign Up" }
              </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-3">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
