import React, { useState } from "react";


import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import API from "@/services/api";



// Simple Logo component (replace with your actual logo)
const Logo = ({ className }) => (
  <div className={`font-bold text-2xl text-primary ${className}`}>
    Logo
  </div>
);

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const Login02 = () => {
  // State management for authentication
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await API.post("/auth/login", data);

      // Save token and user info
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setMessage("Login successful! Redirecting...");
      
      // Redirect to dashboard after success (replace with your routing logic)
      setTimeout(() => {
        window.location.href = "/dashboard"; // Simple redirect
        console.log("Redirecting to dashboard...");
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Placeholder for Google OAuth integration
    console.log("Google login clicked - implement OAuth flow here");
    setError("Google login not implemented yet");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-sm w-full flex flex-col items-center border rounded-lg px-6 py-8 shadow-sm bg-card">
        <Logo className="h-9 w-9" />
        <p className="mt-4 text-xl font-semibold tracking-tight">
          Log in to Your App
        </p>

        <Button 
          className="mt-8 w-full gap-3" 
          onClick={handleGoogleLogin}
          variant="outline"
          disabled={loading}
        >
          <GoogleLogo />
          Continue with Google
        </Button>

        <div className="my-7 w-full flex items-center justify-center overflow-hidden">
          <Separator />
          <span className="text-sm px-2 text-muted-foreground">OR</span>
          <Separator />
        </div>

        {/* Success Message */}
        {message && (
          <Alert className="w-full mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="w-full mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <div className="w-full space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="w-full"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              className="mt-4 w-full" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue with Email"}
            </Button>
          </div>
        </Form>

        <div className="mt-5 space-y-5">
          <a
            href="#"
            className="text-sm block underline text-muted-foreground text-center hover:text-foreground transition-colors"
          >
            Forgot your password?
          </a>
          <p className="text-sm text-center">
            Don't have an account?
            <a href="/signup" className="ml-1 underline text-muted-foreground hover:text-foreground transition-colors">
              Create account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const GoogleLogo = () => (
  <svg
    width="1.2em"
    height="1.2em"
    id="icon-google"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block shrink-0 align-sub text-inherit"
  >
    <g clipPath="url(#clip0)">
      <path
        d="M15.6823 8.18368C15.6823 7.63986 15.6382 7.0931 15.5442 6.55811H7.99829V9.63876H12.3194C12.1401 10.6323 11.564 11.5113 10.7203 12.0698V14.0687H13.2983C14.8122 12.6753 15.6823 10.6176 15.6823 8.18368Z"
        fill="#4285F4"
      />
      <path
        d="M7.99812 16C10.1558 16 11.9753 15.2915 13.3011 14.0687L10.7231 12.0698C10.0058 12.5578 9.07988 12.8341 8.00106 12.8341C5.91398 12.8341 4.14436 11.426 3.50942 9.53296H0.849121V11.5936C2.2072 14.295 4.97332 16 7.99812 16Z"
        fill="#34A853"
      />
      <path
        d="M3.50665 9.53295C3.17154 8.53938 3.17154 7.4635 3.50665 6.46993V4.4093H0.849292C-0.285376 6.66982 -0.285376 9.33306 0.849292 11.5936L3.50665 9.53295Z"
        fill="#FBBC04"
      />
      <path
        d="M7.99812 3.16589C9.13867 3.14825 10.241 3.57743 11.067 4.36523L13.3511 2.0812C11.9048 0.723121 9.98526 -0.0235266 7.99812 -1.02057e-05C4.97332 -1.02057e-05 2.2072 1.70493 0.849121 4.40932L3.50648 6.46995C4.13848 4.57394 5.91104 3.16589 7.99812 3.16589Z"
        fill="#EA4335"
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="15.6825" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default Login02;