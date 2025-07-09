import { CardFooter } from "../components/ui/card"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { loginSuccess } from "../redux/authSlice"
import newRequest from "../utils/newRequest"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm({
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      avatar: "",
      coverImage: "",
    },
  })

  const onSubmit = async (data) => {
    if (step === 1) {
      setStep(2)
      return
    }

    if (!data.avatar?.[0]) {
      setError("avatar", {
        type: "manual",
        message: "Avatar is required",
      })
      return
    }

    setIsLoading(true)
    setServerErrors({})

    try {
      const formData = new FormData()
      formData.append("fullName", data.fullName)
      formData.append("username", data.username)
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("avatar", data.avatar[0])
      if (data.coverImage?.[0]) {
        formData.append("coverImage", data.coverImage[0])
      }

      const registerResponse = await newRequest.post("/api/v1/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (registerResponse.data) {
        const loginResponse = await newRequest.post("/api/v1/users/login", {
          email: data.email,
          password: data.password,
          username: data.username,
        })

        if (loginResponse.data) {
          dispatch(loginSuccess(loginResponse.data.data))
          navigate("/")
        }
      }
    } catch (error) {
      console.error("Registration/Login error:", error)
      window.scrollTo({ top: 0, behavior: "smooth" })

      // Handle user conflict
      if (error.response?.status === 409) {
        setStep(1)
        setServerErrors({ conflict: "User with this username or email already exists" })

        const message = error.response?.data?.message?.toLowerCase() || ""
        if (message.includes("username")) {
          setError("username", {
            type: "conflict",
            message: "This username is already taken",
          })
        }
        if (message.includes("email")) {
          setError("email", {
            type: "conflict",
            message: "This email is already registered",
          })
        }
        return
      }

      // Handle detailed field errors
      if (error.response?.data?.errors) {
        const fieldErrors = error.response.data.errors
        setServerErrors(fieldErrors)

        let goBackToStep1 = false
        Object.entries(fieldErrors).forEach(([key, msg]) => {
          setError(key, { type: "server", message: msg || "Invalid value" })
          if (["fullName", "username", "email", "password"].includes(key)) {
            goBackToStep1 = true
          }
        })

        if (goBackToStep1) setStep(1)
      } else {
        // Fallback for unknown errors
        setServerErrors({ general: "An unexpected error occurred. Please try again later." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            {step === 1
              ? "Enter your information to create an account"
              : "Upload your profile images"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {(Object.keys(serverErrors).length > 0) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {serverErrors.conflict ||
                    serverErrors.general ||
                    "There was an error with your registration. Please check the form fields."}
                </AlertDescription>
              </Alert>
            )}

            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...register("fullName", { required: "Full name is required" })}
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...register("username", {
                      required: "Username is required",
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message: "Username can only contain letters, numbers and underscores",
                      },
                    })}
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Please enter a valid email",
                      },
                    })}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar</Label>
                  <Input
                    id="avatar"
                    type="file"
                    {...register("avatar", { required: "Avatar is required" })}
                    className={errors.avatar ? "border-red-500" : ""}
                  />
                  {errors.avatar && <p className="text-red-500 text-sm">{errors.avatar.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverImage">Cover Image (Optional)</Label>
                  <Input id="coverImage" type="file" {...register("coverImage")} />
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex mt-5 flex-col sm:flex-row justify-between items-center gap-4">
            {step === 2 && (
              <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isLoading}>
                Back
              </Button>
            )}

            <Button type="submit" disabled={isLoading} className={step === 1 ? "w-full mt-5 sm:w-auto" : ""}>
              {isLoading ? "Processing..." : step === 1 ? "Next" : "Register"}
            </Button>

            {step === 1 && (
              <p className="text-center mt-5 text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-primary underline">
                  Login
                </Link>
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
