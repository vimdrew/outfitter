import { useMutation } from "@tanstack/react-query";
import { ImagePlus, Loader2Icon, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { $uploadImage } from "@/lib/cloudinary/upload";
import type { Category, ClothingItemWithDetails, Color, Season } from "@/lib/wardrobe/types";
import { CATEGORIES, CATEGORY_LABELS, SEASONS, SEASON_LABELS } from "@/lib/wardrobe/types";

const COLORS: Color[] = [
  "black",
  "white",
  "gray",
  "navy",
  "blue",
  "light-blue",
  "red",
  "pink",
  "orange",
  "yellow",
  "green",
  "olive",
  "brown",
  "tan",
  "beige",
  "purple",
  "burgundy",
  "cream",
  "multi",
  "other",
];

interface ItemUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (item: ClothingItemWithDetails) => void;
}

export function ItemUploadDialog({ open, onOpenChange, onSuccess }: ItemUploadDialogProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const uploadTimestamp = useRef<number | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync: uploadImage } = useMutation({
    mutationFn: async ({ dataUrl, fileName }: { dataUrl: string; fileName: string }) => {
      return $uploadImage({ data: { dataUrl, fileName } });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleColorToggle = (color: Color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const handleSeasonToggle = (season: Season) => {
    setSelectedSeasons((prev) =>
      prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season],
    );
  };

  const resetForm = useCallback(() => {
    setImagePreview(null);
    setFileName("");
    setName("");
    setCategory("");
    setSelectedColors([]);
    setSelectedSeasons([]);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.SubmitEvent) => {
      e.preventDefault();

      if (!imagePreview || !category) return;

      try {
        setIsUploading(true);
        const timestamp = Date.now();
        uploadTimestamp.current = timestamp;

        const result = await uploadImage({
          dataUrl: imagePreview,
          fileName: fileName || `clothing-${timestamp}`,
        });

        onSuccess?.({
          id: "",
          name,
          imageUrl: result.imageUrl,
          imagePublicId: result.publicId,
          category,
          isPublic: true,
          timesWorn: 0,
          createdAt: new Date(),
          colors: selectedColors.map((color) => ({ color })),
          seasons: selectedSeasons.map((season) => ({ season })),
          tags: [],
        });

        resetForm();
        setIsUploading(false);
        onOpenChange(false);
      } catch (error) {
        setIsUploading(false);
        console.error("Upload failed:", error);
      }
    },
    [
      imagePreview,
      category,
      fileName,
      name,
      selectedColors,
      selectedSeasons,
      uploadImage,
      onSuccess,
      onOpenChange,
      resetForm,
    ],
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Clothing Item</DialogTitle>
          <DialogDescription>
            Upload a photo of your clothing item and add details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center justify-center">
              {imagePreview ? (
                <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-lg border">
                  <img alt="Preview" className="h-full w-full object-cover" src={imagePreview} />
                  <Button
                    className="absolute top-2 right-2"
                    size="icon"
                    type="button"
                    variant="secondary"
                    onClick={() => setImagePreview(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex aspect-square w-full max-w-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:bg-muted">
                  <ImagePlus className="mb-2 h-10 w-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload</span>
                  <input
                    accept="image/*"
                    className="hidden"
                    type="file"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Blue Oxford Shirt"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Colors</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <label className="flex cursor-pointer items-center gap-2" key={color}>
                    <Checkbox
                      checked={selectedColors.includes(color)}
                      onCheckedChange={() => handleColorToggle(color)}
                    />
                    <span className="text-sm capitalize">{color.replace("-", " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Seasons</Label>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map((season) => (
                  <label className="flex cursor-pointer items-center gap-2" key={season}>
                    <Checkbox
                      checked={selectedSeasons.includes(season)}
                      onCheckedChange={() => handleSeasonToggle(season)}
                    />
                    <span className="text-sm">{SEASON_LABELS[season]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button disabled={!imagePreview || !category || isUploading} type="submit">
              {isUploading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
