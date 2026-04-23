"use client";

import { useMutation, useQuery } from "convex/react";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FileUpload } from "~/components/ui/file-upload";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { formatCurrency } from "~/lib/utils";

interface Partner {
  _id: Id<"partners">;
  name: string;
  logo: string;
  logoUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function PartnersSettingsPage() {
  const partnersResult = useQuery(api.partners.list);
  const partners: Partner[] = partnersResult?.success
    ? partnersResult.data
    : [];

  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    isActive: true,
  });

  const createPartner = useMutation(api.partners.create);
  const updatePartner = useMutation(api.partners.update);
  const deletePartner = useMutation(api.partners.remove);
  const reorderPartners = useMutation(api.partners.reorder);

  const isLoadingData = partnersResult === undefined;

  const handleOpenSheet = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        logo: partner.logo,
        isActive: partner.isActive,
      });
    } else {
      setEditingPartner(null);
      setFormData({ name: "", logo: "", isActive: true });
    }
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Partner name is required");
      return;
    }
    if (!formData.logo) {
      toast.error("Partner logo is required");
      return;
    }

    setIsLoading(true);
    try {
      if (editingPartner) {
        const res = await updatePartner({
          partnerId: editingPartner._id,
          name: formData.name,
          logo: formData.logo,
          isActive: formData.isActive,
        });
        if (!res.success) throw new Error(res.error);
        toast.success("Partner updated successfully");
      } else {
        const maxOrder =
          partners.length > 0 ? Math.max(...partners.map((p) => p.order)) : -1;
        const res = await createPartner({
          name: formData.name,
          logo: formData.logo,
          isActive: formData.isActive,
          order: maxOrder + 1,
        });
        if (!res.success) throw new Error(res.error);
        toast.success("Partner created successfully");
      }
      setIsSheetOpen(false);
      setFormData({ name: "", logo: "", isActive: true });
      setEditingPartner(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (partnerId: Id<"partners">) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;

    try {
      const res = await deletePartner({ partnerId });
      if (!res.success) throw new Error(res.error);
      toast.success("Partner deleted successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleToggleActive = async (partner: Partner) => {
    try {
      const res = await updatePartner({
        partnerId: partner._id,
        isActive: !partner.isActive,
      });
      if (!res.success) throw new Error(res.error);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleMove = async (partner: Partner, direction: "up" | "down") => {
    const sorted = [...partners].sort((a, b) => a.order - b.order);
    const currentIndex = sorted.findIndex((p) => p._id === partner._id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= sorted.length) return;

    const newOrder = sorted.map((p, index) => {
      if (p._id === partner._id) return sorted[newIndex]._id;
      if (p._id === sorted[newIndex]._id) return partner._id;
      return p._id;
    });

    try {
      const res = await reorderPartners({ orderedIds: newOrder });
      if (!res.success) throw new Error(res.error);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reorder");
    }
  };

  const sortedPartners = [...partners].sort((a, b) => a.order - b.order);

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Partners</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage partner logos displayed in the marquee on the homepage.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenSheet()}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Partner
        </button>
      </div>

      {partners.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">No partners added yet.</p>
          <button
            type="button"
            onClick={() => handleOpenSheet()}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Add your first partner
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedPartners.map((partner, index) => (
                <tr key={partner._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(partner, "up")}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-gray-500">{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleMove(partner, "down")}
                        disabled={index === sortedPartners.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                      {partner.logoUrl ? (
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No logo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {partner.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(partner)}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        partner.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {partner.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenSheet(partner)}
                        className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                        title="Edit Partner"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(partner._id)}
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete Partner"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {editingPartner ? "Edit Partner" : "Add New Partner"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 py-4">
            <div>
              <label
                htmlFor="partner-name"
                className="block text-sm font-medium text-gray-700"
              >
                Partner Name *
              </label>
              <input
                id="partner-name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Google"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">
                Logo *
              </span>
              <FileUpload
                className="mt-1"
                onUploadComplete={(storageId) =>
                  setFormData((prev) => ({ ...prev, logo: storageId }))
                }
                onRemove={() => setFormData((prev) => ({ ...prev, logo: "" }))}
                disabled={isLoading}
              />
              {formData.logo && (
                <p className="mt-1 text-xs text-green-600">Logo uploaded</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="partner-active"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="partner-active" className="text-sm text-gray-700">
                Active (show in marquee)
              </label>
            </div>
          </div>

          <SheetFooter>
            <button
              type="button"
              onClick={() => setIsSheetOpen(false)}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? editingPartner
                  ? "Saving..."
                  : "Creating..."
                : editingPartner
                  ? "Save Changes"
                  : "Create Partner"}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
