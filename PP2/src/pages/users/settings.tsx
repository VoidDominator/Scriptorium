"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
    phoneNumber: "",
  });

  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          throw new Error("Access token missing. Please log in again.");
        }

        const response = await fetch("/api/users/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile.");
        }

        const data = await response.json();
        setProfile(data);
        setAvatarPreview(data.avatar);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewAvatar(file);
      setAvatarPreview(URL.createObjectURL(file)); // Show preview of the uploaded file
    }
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("Access token missing. Please log in again.");
      }

      const formData = new FormData();
      formData.append("firstName", profile.firstName);
      formData.append("lastName", profile.lastName);
      formData.append("email", profile.email);
      formData.append("phoneNumber", profile.phoneNumber);
      if (newAvatar) {
        formData.append("avatar", newAvatar); // Include the new avatar file
      }

      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update profile.");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile.user);
      setAvatarPreview(updatedProfile.user.avatar);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted">
      <Card className="w-full max-w-[600px] shadow-lg">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={avatarPreview || "/default-avatar.png"} alt="User Avatar" />
            <AvatarFallback>
              {profile.firstName[0]}
              {profile.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{`${profile.firstName} ${profile.lastName}`}</CardTitle>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4 p-6">
          {error && <p className="text-red-500">{error}</p>}
          {!isEditing ? (
            <>
              <div>
                <Label className="block mb-1 font-medium">Phone Number</Label>
                <p className="text-muted-foreground">{profile.phoneNumber || "N/A"}</p>
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="firstName" className="block mb-1 font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="block mb-1 font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email" className="block mb-1 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber" className="block mb-1 font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="text"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="avatar" className="block mb-1 font-medium">
                  Avatar
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
