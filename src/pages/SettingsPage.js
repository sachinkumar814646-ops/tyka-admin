"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  Save,
  Globe,
  Info,
  Share2,
  Layout,
  Truck,
  Contact,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const SettingsPage = () => {
  const { authUserId } = useParams();
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");

  const [settings, setSettings] = useState({
    appName: "",
    footerText: "",
    logo: "",
    favicon: "",
    email: "",
    phone: "",
    address: "",
    googleAnalytics: "",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    metaSiteName: "",
    metaDescription: "",
    meta_keyword: "",
    metaImage: "",
    facebookAppId: "",
    metaTwitterSite: "",
    metaTwitterCreator: "",
    store_image: "",
    shipping_charge: "",
  });

  const mapBackendToFrontend = (dataArray) => {
    const map = {};
    dataArray.forEach((item) => {
      switch (item.name) {
        case "app_name":
          map.appName = item.val || "";
          break;
        case "footer_text":
          map.footerText = item.val || "";
          break;
        case "logo":
          map.logo = item.val || "";
          break;
        case "favicon":
          map.favicon = item.val || "";
          break;
        case "email":
          map.email = item.val || "";
          break;
        case "phone":
          map.phone = item.val || "";
          break;
        case "address":
          map.address = item.val || "";
          break;
        case "google_analytics":
          map.googleAnalytics = item.val || "";
          break;
        case "facebook_url":
          map.facebookUrl = item.val || "";
          break;
        case "twitter_url":
          map.twitterUrl = item.val || "";
          break;
        case "instagram_url":
          map.instagramUrl = item.val || "";
          break;
        case "linkedin_url":
          map.linkedinUrl = item.val || "";
          break;
        case "youtube_url":
          map.youtubeUrl = item.val || "";
          break;
        case "meta_site_name":
          map.metaSiteName = item.val || "";
          break;
        case "meta_description":
          map.metaDescription = item.val || "";
          break;
        case "meta_keywords":
        case "meta_keyword":
          map.meta_keyword = item.val || "";
          break;
        case "meta_image":
          map.metaImage = item.val || "";
          break;
        case "facebook_app_id":
        case "meta_fb_app_id":
          map.facebookAppId = item.val || "";
          break;
        case "meta_twitter_site":
          map.metaTwitterSite = item.val || "";
          break;
        case "meta_twitter_creator":
          map.metaTwitterCreator = item.val || "";
          break;
        case "store_image":
          map.store_image = item.val || "";
          break;
        case "shipping_charge":
          map.shipping_charge = item.val || "";
          break;
        default:
          break;
      }
    });
    return map;
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res1 = await axios.get(
          "https://tyka.premierhostings.com/beta/api/settings?page=1",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const res2 = await axios.get(
          "https://tyka.premierhostings.com/beta/api/settings?page=2",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const res3 = await axios.get(
          "https://tyka.premierhostings.com/beta/api/settings?page=3",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (
          res1.data?.settings?.data ||
          res2.data?.settings?.data ||
          res3.data?.settings?.data
        ) {
          const mapped1 = mapBackendToFrontend(res1.data.settings.data || []);
          const mapped2 = mapBackendToFrontend(res2.data.settings.data || []);
          const mapped3 = mapBackendToFrontend(res3.data.settings.data || []);
          setSettings((prev) => ({
            ...prev,
            ...mapped1,
            ...mapped2,
            ...mapped3,
          }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to fetch settings");
      }
    };

    fetchSettings();
  }, [token]);

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("user_id", authUserId);
      formData.append("app_name", settings.appName || "");
      formData.append("footer_text", settings.footerText || "");
      formData.append("email", settings.email || "");
      formData.append("phone", settings.phone || "");
      formData.append("address", settings.address || "");
      formData.append("google_analytics", settings.googleAnalytics || "");
      formData.append("facebook_url", settings.facebookUrl || "");
      formData.append("twitter_url", settings.twitterUrl || "");
      formData.append("instagram_url", settings.instagramUrl || "");
      formData.append("linkedin_url", settings.linkedinUrl || "");
      formData.append("youtube_url", settings.youtubeUrl || "");
      formData.append("meta_site_name", settings.metaSiteName || "");
      formData.append("meta_description", settings.metaDescription || "");
      formData.append("meta_keyword", settings.meta_keyword || "");
      formData.append("facebook_app_id", settings.facebookAppId || "");
      formData.append("meta_twitter_site", settings.metaTwitterSite || "");
      formData.append(
        "meta_twitter_creator",
        settings.metaTwitterCreator || ""
      );
      formData.append("shipping_charge", settings.shipping_charge || "");

      // ✅ Fix: check if file uploaded or old string
      if (settings.logo) {
        formData.append(
          "logo",
          settings.logo.file ? settings.logo.file : settings.logo
        );
      }
      if (settings.favicon) {
        formData.append(
          "favicon",
          settings.favicon.file ? settings.favicon.file : settings.favicon
        );
      }
      if (settings.store_image) {
        formData.append(
          "store_image",
          settings.store_image.file
            ? settings.store_image.file
            : settings.store_image
        );
      }

      const settingsRes = await axios.post(
        "https://tyka.premierhostings.com/beta/api/settings",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Save Settings Response:", settingsRes.data);
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage basic, address, social, SEO, and shipping settings
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* --- Basic Details --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Layout className="h-5 w-5" />
              Basic Details
            </CardTitle>
            <CardDescription>App name, footer, logo & favicon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label>App Name</label>
                <Input
                  placeholder="App Name"
                  value={settings.appName}
                  onChange={(e) => handleInputChange("appName", e.target.value)}
                />
              </div>
              <div>
                <label>Footer Text</label>
                <textarea
                  placeholder="Footer Text"
                  value={settings.footerText}
                  onChange={(e) =>
                    handleInputChange("footerText", e.target.value)
                  }
                  className="w-full rounded-md border h-32 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                />
              </div>
              {/* Logo Upload */}
              <div className="space-y-1 ">
                <label className="block text-sm font-medium text-gray-700 ">
                  Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const previewUrl = URL.createObjectURL(file);
                      handleInputChange("logo", { file, preview: previewUrl });
                    }
                  }}
                />
                {settings.logo && (
                  <img
                    src={
                      settings.logo.preview
                        ? settings.logo.preview
                        : `https://tyka.premierhostings.com/beta/storage/logo/${settings.logo}`
                    }
                    alt="Logo Preview"
                    className="mt-2 h-32 w-32 object-contain border border-gray-300 rounded "
                  />
                )}
              </div>

              {/* Favicon Upload */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Favicon
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const previewUrl = URL.createObjectURL(file);
                      handleInputChange("favicon", {
                        file,
                        preview: previewUrl,
                      });
                    }
                  }}
                />
                {settings.favicon && (
                  <img
                    src={
                      settings.favicon.preview
                        ? settings.favicon.preview
                        : `https://tyka.premierhostings.com/beta/storage/favicon/${settings.favicon}`
                    }
                    alt="Favicon Preview"
                    className="mt-2 h-20 w-20 object-contain border border-gray-300 rounded"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Contact Details --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Contact className="h-5 w-5" />
              Contact Details
            </CardTitle>
            <CardDescription>Contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label>Email</label>
                <Input
                  placeholder="Email"
                  value={settings.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div>
                <label>Phone</label>
                <PhoneInput
                  country={"in"}
                  value={settings.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                  inputStyle={{
                    width: "100%",
                    height: "40px",
                    borderRadius: "0.375rem",
                    borderColor: "#d1d5db",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Social Links --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Share2 className="h-5 w-5" />
              Social Links
            </CardTitle>
            <CardDescription>All your social media URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label>Facebook URL</label>
                <Input
                  placeholder="Facebook URL"
                  value={settings.facebookUrl}
                  onChange={(e) =>
                    handleInputChange("facebookUrl", e.target.value)
                  }
                />
              </div>
              <div>
                <label>Twitter URL</label>
                <Input
                  placeholder="Twitter URL"
                  value={settings.twitterUrl}
                  onChange={(e) =>
                    handleInputChange("twitterUrl", e.target.value)
                  }
                />
              </div>
              <div>
                <label>Instagram URL</label>
                <Input
                  placeholder="Instagram URL"
                  value={settings.instagramUrl}
                  onChange={(e) =>
                    handleInputChange("instagramUrl", e.target.value)
                  }
                />
              </div>
              <div>
                <label>LinkedIn URL</label>
                <Input
                  placeholder="LinkedIn URL"
                  value={settings.linkedinUrl}
                  onChange={(e) =>
                    handleInputChange("linkedinUrl", e.target.value)
                  }
                />
              </div>
              <div>
                <label>YouTube URL</label>
                <Input
                  placeholder="YouTube URL"
                  value={settings.youtubeUrl}
                  onChange={(e) =>
                    handleInputChange("youtubeUrl", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Meta Details --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Info className="h-5 w-5" />
              Meta Details
            </CardTitle>
            <CardDescription>
              SEO-related settings and social preview data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label>Meta Site Name</label>
                <Input
                  placeholder="Meta Site Name"
                  value={settings.metaSiteName}
                  onChange={(e) =>
                    handleInputChange("metaSiteName", e.target.value)
                  }
                />
              </div>
              <div>
                <label>Meta Description</label>
                <Input
                  placeholder="Meta Description"
                  value={settings.metaDescription}
                  onChange={(e) =>
                    handleInputChange("metaDescription", e.target.value)
                  }
                />
              </div>

              <div>
                <label>Meta Keywords</label>
                <Input
                  placeholder="Meta Keywords"
                  value={settings.meta_keyword}
                  onChange={(e) =>
                    handleInputChange("meta_keyword", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Meta Details --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Info className="h-5 w-5" />
              Store Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Store Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const previewUrl = URL.createObjectURL(file);
                      handleInputChange("store_image", {
                        file,
                        preview: previewUrl,
                      });
                    }
                  }}
                  className="mt-2"
                />
                {settings.store_image && (
                  <img
                    src={
                      settings.store_image.preview
                        ? settings.store_image.preview
                        : `https://tyka.premierhostings.com/beta/storage/store_image/${settings.store_image}`
                    }
                    alt="Store Preview"
                    className="mt-3  h-32 w-32 md:h-48 md:w-48 lg:h-64 lg:w-64 object-cover border border-gray-300 rounded-lg shadow-sm"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Shipping Charges --- */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Truck className="h-5 w-5" />
              Shipping Charges
            </CardTitle>
            <CardDescription>
              Manage shipping fee rules and thresholds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label>Shipping Charge</label>
                <Input
                  type="number"
                  placeholder="Shipping Charge"
                  value={settings.shipping_charge}
                  onChange={(e) =>
                    handleInputChange("shipping_charge", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
