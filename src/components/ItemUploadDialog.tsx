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
import { CORE_COLORS, COLOR_HEX, extractColorsFromImage } from "@/lib/colors";
import type { Category, ClothingItemWithDetails, Color, Season } from "@/lib/wardrobe/types";
import { CATEGORIES, CATEGORY_LABELS, SEASONS, SEASON_LABELS } from "@/lib/wardrobe/types";

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
  const [extractedColors, setExtractedColors] = useState<Color[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const uploadTimestamp = useRef<number | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync: uploadImage } = useMutation({
    mutationFn: async ({ dataUrl, fileName }: { dataUrl: string; fileName: string }) => {
      return $uploadImage({ data: { dataUrl, fileName } });
    },
  });

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setFileName(file.name);

      const colors = await extractColorsFromImage(dataUrl);
      setExtractedColors(colors);
      setSelectedColors(colors);
    };
    reader.readAsDataURL(file);
  }, []);

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
    setExtractedColors([]);
    setSelectedSeasons([]);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
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
      <DialogContent className="animate-slide-in-up max-h-[90vh] overflow-y-auto rounded-sm border border-foreground/20 sm:max-w-[480px]">
        <DialogHeader className="border-b border-foreground/10 pb-4">
          <DialogTitle className="text-xs tracking-widest uppercase">Add Clothing Item</DialogTitle>
          <DialogDescription className="text-xs tracking-wider text-muted-foreground uppercase">
            Upload a photo of your clothing item and add details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            <div className="flex flex-col items-center justify-center">
              {imagePreview ? (
                <div className="relative aspect-square w-full max-w-[280px] overflow-hidden border border-foreground/20">
                  <img alt="Preview" className="h-full w-full object-cover" src={imagePreview} />
                  <Button
                    className="absolute top-2 right-2 h-7 w-7 rounded-sm border border-foreground/20 bg-background/80"
                    size="icon"
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setImagePreview(null);
                      setExtractedColors([]);
                      setSelectedColors([]);
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="flex aspect-square w-full max-w-[280px] cursor-pointer flex-col items-center justify-center border border-dashed border-foreground/20 bg-muted/30 transition-colors hover:bg-muted/50">
                  <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-xs tracking-widest text-muted-foreground uppercase">
                    Click to upload
                  </span>
                  <input
                    accept="image/*"
                    className="hidden"
                    type="file"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label className="text-[10px] tracking-widest uppercase" htmlFor="name">
                Name
              </Label>
              <Input
                id="name"
                className="rounded-sm border-foreground/20 bg-background"
                placeholder="e.g., Blue Oxford Shirt"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="text-[10px] tracking-widest uppercase" htmlFor="category">
                Category
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="rounded-sm border-foreground/20 bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-[10px] tracking-widest uppercase">
                Colors {extractedColors.length > 0 && "(auto-detected)"}
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {CORE_COLORS.map((color) => {
                  const isSelected = selectedColors.includes(color);
                  const isExtracted = extractedColors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorToggle(color)}
                      className={`flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs transition-all ${
                        isSelected
                          ? "border-foreground bg-foreground text-background"
                          : "border-foreground/20 hover:border-foreground/50"
                      } `}
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-foreground/30"
                        style={{
                          backgroundColor: color === "multi" ? "transparent" : COLOR_HEX[color],
                          background:
                            color === "multi"
                              ? "conic-gradient(red, yellow, green, blue, red)"
                              : undefined,
                        }}
                      />
                      <span className="capitalize">{color}</span>
                      {isExtracted && !isSelected && (
                        <span className="ml-1 text-[9px] tracking-wider text-muted-foreground uppercase">
                          (suggested)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-[10px] tracking-widest uppercase">Seasons</Label>
              <div className="flex flex-wrap gap-1.5">
                {SEASONS.map((season) => (
                  <label className="flex cursor-pointer items-center gap-1.5" key={season}>
                    <Checkbox
                      className="h-3.5 w-3.5 rounded-sm border-foreground/30"
                      checked={selectedSeasons.includes(season)}
                      onCheckedChange={() => handleSeasonToggle(season)}
                    />
                    <span className="text-xs">{SEASON_LABELS[season]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-foreground/10 pt-4">
            <Button
              disabled={!imagePreview || !category || isUploading}
              type="submit"
              className="w-full rounded-sm border border-foreground/20 bg-foreground text-background hover:bg-foreground/90"
            >
              {isUploading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              <span className="text-xs tracking-widest uppercase">
                {isUploading ? "Adding..." : "Add Item"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
