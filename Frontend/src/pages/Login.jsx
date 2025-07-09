import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../redux/authSlice";
import newRequest from "../utils/newRequest";
import { Alert } from "../components/ui/alert";

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    dispatch(loginStart());

    try {
      setIsLoading(true);

      const response = await newRequest.post(
        "/api/v1/users/login",
        {
          email: data.email,
          username: data.username,
          password: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data.statusCode === 200) {
        dispatch(loginSuccess(response.data)); // Dispatch login data
        console.log(response.data);
        
        navigate("/");
      } else {
        dispatch(loginFailure("Invalid credentials"));
        Alert("Login failed: Invalid credentials.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Login failed: Something went wrong. Please try again.";
      dispatch(loginFailure(message));
      Alert(message);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white-900 text-gray">
      <div className="w-full max-w-sm p-6 bg-white-800 rounded-lg shadow-md">
        <div className="text-center text-2xl font-bold mb-6">Login</div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="username" className="text-gray-900">Username</label>
            <input
              id="username"
              type="text"
              disabled={isLoading}
              placeholder="Enter your username"
              {...register("username")}
              className={`w-full mt-1 rounded-md border px-3 py-2 ${
                errors.username ? "border-red-500" : "border-gray-500"
              }`}
            />
          </div>

          <div>
            <label htmlFor="email" className="text-gray-900">Email*</label>
            <input
              id="email"
              type="email"
              disabled={isLoading}
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email address",
                },
              })}
              className={`w-full mt-1 rounded-md border px-3 py-2 ${
                errors.email ? "border-red-500" : "border-gray-500"
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-gray-900">Password*</label>
            <input
              id="password"
              type="password"
              disabled={isLoading}
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 5,
                  message: "Password must be at least 8 characters",
                },
              })}
              className={`w-full mt-1 rounded-md border px-3 py-2 ${
                errors.password ? "border-red-500" : "border-gray-500"
              }`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 py-2 rounded-md text-white font-semibold"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
