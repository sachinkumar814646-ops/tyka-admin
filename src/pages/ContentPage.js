"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { FileText, ImageIcon, Globe } from "lucide-react";
import BannerManagement from "../components/content/Banner/BannerManagement";
import SliderManagement from "../components/content/Slider/SliderManagement";
import BlogManagement from "../components/content/Blog/BlogManagement";
import StatsCard from "../components/common/Card";

const ContentPage = () => {
  const [activeTab, setActiveTab] = useState("banners");

  // ✅ Static Dummy Stats (No API calls)
  const stats = {
    activeBanners: 5,
    homepageSections: 3,
    publishedPosts: 10,
    draftPosts: 4,
  };

  // ✅ Dummy callback to match child props
  const handleStatsUpdate = () => {
    console.log("Stats updated (dummy)"); // Just for debugging
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">
          Website Content Management
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage banners, homepage sections, and blog content
        </p>
      </div>

      {/* ✅ Stats Cards - Static Values */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <StatsCard
          title="Active Banners"
          value={stats.activeBanners}
          icon={<ImageIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Homepage Sections"
          value={stats.homepageSections}
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Published Posts"
          value={stats.publishedPosts}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Draft Posts"
          value={stats.draftPosts}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Tabs - Responsive */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-center sm:justify-start space-x-0 sm:space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg gap-2 sm:gap-0">
            <button
              onClick={() => setActiveTab("banners")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === "banners"
                  ? "bg-white dark:bg-gray-700 text-red-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-600"
              }`}
            >
              Banners
            </button>
            <button
              onClick={() => setActiveTab("homepage")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === "homepage"
                  ? "bg-white dark:bg-gray-700 text-red-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-600"
              }`}
            >
              Sliders
            </button>
            <button
              onClick={() => setActiveTab("blog")}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                activeTab === "blog"
                  ? "bg-white dark:bg-gray-700 text-red-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-600"
              }`}
            >
              Blog Management
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "banners" && (
            <BannerManagement onStatsUpdate={handleStatsUpdate} />
          )}
          {activeTab === "homepage" && (
            <SliderManagement onStatsUpdate={handleStatsUpdate} />
          )}
          {activeTab === "blog" && (
            <BlogManagement onStatsUpdate={handleStatsUpdate} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentPage;
