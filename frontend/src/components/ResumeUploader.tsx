import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import { useResume } from "../context/ResumeContext";
import api from "../lib/api";

const ResumeUploader = () => {
  const [resumeText, setResumeText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentResumeId } = useResume();

  const UPLOAD_ENDPOINT = "/upload/pdf";

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      console.log("Starting upload for file:", file.name);

      const formData = new FormData();
      formData.append("file", file);

      // Single API call - upload now handles both file upload and text extraction
      const uploadResponse = await api.post(UPLOAD_ENDPOINT, formData);
      console.log("Upload successful:", uploadResponse.data);

      // The upload endpoint now returns extracted text directly
      if (uploadResponse.data.success && uploadResponse.data.data) {
        const resumeData = uploadResponse.data.data;
        setResumeText(resumeData.resume_text || "");

        // Update current resume by ID only
        await setCurrentResumeId(resumeData.resume_id);
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status: number; data: unknown };
        };
        if (axiosError.response?.status === 422) {
          console.error("Validation error details:", axiosError.response.data);
          setError("Invalid file format or data. Please try again.");
        } else if (axiosError.response?.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError("An error occurred during upload.");
        }
      } else if (error instanceof Error) {
        setError(error.message || "An error occurred during upload.");
      } else {
        setError("An error occurred during upload.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    uploadFile(e.target.files?.[0] as File);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === "application/pdf" || file.type === "text/plain")
    ) {
      // Handle file upload the same way as handleFileUpload
      uploadFile(file as File);
    }
  };

  const handleSubmit = () => {
    if (resumeText.trim()) {
      console.log(resumeText);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center px-4 py-16 bg-gray-100">
      <h1 className="text-5xl text-gray-900 mb-6">Resume Builder Assistant</h1>
      <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
        Upload your resume. Get personalized feedback, analyze job fit, prepare
        for interviews, and create a career roadmap.
      </p>
      {/* Upload Widget */}
      <Card className="max-w-4xl mx-auto mb-16 shadow-xl border-0 bg-white">
        <CardContent className="p-8 flex justify-center items-center gap-5">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg mb-2 text-gray-900">
              Drag & drop your resume here
            </h3>
            <p className="text-gray-600 mb-6">
              or click to browse files (PDF, DOC, TXT)
            </p>

            <div className="space-y-4">
              <input
                type="file"
                id="resume-upload"
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                disabled={isUploading}
              >
                <label htmlFor="resume-upload" className="cursor-pointer">
                  {isUploading ? "Uploading..." : "Upload Resume"}
                </label>
              </Button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeUploader;
