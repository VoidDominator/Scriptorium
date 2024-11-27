"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { fetchWithAuthRetry } from "@/utils/fetchWithAuthRetry";
import BarChartIcon from "@mui/icons-material/BarChart";
import ArticleIcon from "@mui/icons-material/Article";
import CommentIcon from "@mui/icons-material/Comment";
import DescriptionIcon from "@mui/icons-material/Description";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
    createTime: "",
  });
  const [stats, setStats] = useState({
    blogPosts: 0,
    comments: 0,
    templates: 0,
    voteUpsPosts: 0,
    voteUpsComments: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        setLoading(true);

        // Fetch profile
        const profileResponse = await fetchWithAuthRetry("/api/users/profile");
        if (!profileResponse.ok) {
          router.push("/users/signin");
        //   toast.error("Failed to fetch profile.");
        //   throw new Error("Failed to fetch profile.");
        }
        const profileData = await profileResponse.json();
        setProfile(profileData);

        const statsResponse = await fetchWithAuthRetry("/api/users/stats");
        if (!statsResponse.ok) {
          router.push("/users/signin");
        //   toast.error("Failed to fetch user stats.");
        //   throw new Error("Failed to fetch user stats.");
        }
        const statsData = await statsResponse.json();
        setStats(statsData);
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200">
  <Card className="w-full max-w-[700px] shadow-xl border border-gray-200 rounded-lg overflow-hidden">
    <CardHeader className="flex flex-col items-center bg-blue-500 text-white py-6">
      <Avatar className="h-28 w-28 mb-4 overflow-hidden rounded-full border-4 border-white shadow-md">
        <AvatarImage
          src={profile.avatar || "/default-avatar.png"}
          alt="User Avatar"
          className="h-full w-full object-cover"
        />
        <AvatarFallback className="flex items-center justify-center bg-gray-500 text-white font-semibold text-lg">
          {profile.firstName[0]?.toUpperCase()}
          {profile.lastName[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <CardTitle className="text-3xl font-semibold">{`${profile.firstName} ${profile.lastName}`}</CardTitle>
      <p className="text-sm opacity-80">{profile.email}</p>
    </CardHeader>
    <CardContent className="p-6 bg-white space-y-6">
      {error && <p className="text-red-500">{error}</p>}
      <div className="bg-gray-100 p-4 rounded-md shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
          <span className="material-icons mr-2 text-blue-500">info</span>
          Account Information
        </h3>
        <p className="mt-2">
          <strong>Member since:</strong>{" "}
          {new Date(profile.createTime).toLocaleDateString()}
        </p>
      </div>
      <Separator />
      <div className="bg-gray-100 p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700 flex items-center">
        <BarChartIcon className="mr-2 text-green-500" />
        Statistics
      </h3>
      <ul className="mt-4 grid grid-cols-2 gap-4">
        <li className="flex items-center space-x-3">
          <ArticleIcon className="text-purple-500" />
          <p>
            <strong>Blog Posts:</strong> {stats.blogPosts}
          </p>
        </li>
        <li className="flex items-center space-x-3">
          <CommentIcon className="text-orange-500" />
          <p>
            <strong>Comments:</strong> {stats.comments}
          </p>
        </li>
        <li className="flex items-center space-x-3">
          <DescriptionIcon className="text-yellow-500" />
          <p>
            <strong>Templates:</strong> {stats.templates}
          </p>
        </li>
        <li className="flex items-center space-x-3">
          <ThumbUpIcon className="text-blue-500" />
          <p>
            <strong>Vote Ups (Posts):</strong> {stats.voteUpsPosts}
          </p>
        </li>
        <li className="flex items-center space-x-3">
          <ThumbUpIcon className="text-red-500" />
          <p>
            <strong>Vote Ups (Comments):</strong> {stats.voteUpsComments}
          </p>
        </li>
      </ul>
    </div>
    </CardContent>
  </Card>
</div>

  );
}
