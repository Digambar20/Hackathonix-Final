"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Trash2, Handshake } from "lucide-react";

type Sponsor = {
  id: string;
  name: string;
  tier: string;
  websiteUrl: string | null;
  isVisible: boolean;
  displayOrder: number;
};

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [form, setForm] = useState({
    name: "",
    tier: "",
    websiteUrl: "",
    displayOrder: "100",
  });

  const fetchSponsors = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/admin/sponsors", { cache: "no-store" })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body?.error || `Failed to load sponsors (HTTP ${r.status})`);
        return body;
      })
      .then((data) => setSponsors(Array.isArray(data) ? data : []))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load sponsors"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((session) => setIsSuperAdmin(session?.user?.role === "SUPERADMIN"))
      .catch(() => setIsSuperAdmin(false));
  }, []);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  const addSponsor = async () => {
    setSaving("create");
    setError("");
    try {
      const res = await fetch("/api/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          tier: form.tier,
          websiteUrl: form.websiteUrl,
          displayOrder: Math.max(0, Number(form.displayOrder) || 0),
          isVisible: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to add sponsor");

      setForm({ name: "", tier: "", websiteUrl: "", displayOrder: "100" });
      fetchSponsors();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add sponsor");
    }
    setSaving(null);
  };

  const patchSponsor = async (id: string, payload: Record<string, unknown>) => {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/sponsors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to update sponsor");
      fetchSponsors();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update sponsor");
    }
    setSaving(null);
  };

  const removeSponsor = async (id: string) => {
    if (!confirm("Delete this sponsor?")) return;
    setSaving(id + "_delete");
    try {
      const res = await fetch(`/api/admin/sponsors/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to delete sponsor");
      fetchSponsors();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete sponsor");
    }
    setSaving(null);
  };

  if (!isSuperAdmin) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive">Superadmin Access Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Only superadmins can manage homepage sponsors.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-foreground">
          Manage <span className="text-primary">Sponsors</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Add/remove sponsors and choose who appears on homepage.</p>
      </div>

      <Card className="border-primary/30 bg-primary/[0.04]">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-wider">Add Sponsor</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Name</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tier</Label>
            <Input value={form.tier} onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Website URL (optional)</Label>
            <Input value={form.websiteUrl} onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Order</Label>
            <Input type="number" min={0} value={form.displayOrder} onChange={(e) => setForm((p) => ({ ...p, displayOrder: e.target.value }))} />
          </div>

          <div className="md:col-span-4">
            <Button onClick={addSponsor} disabled={saving === "create"} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving === "create" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Handshake className="w-4 h-4 mr-2" />}
              Add Sponsor
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">{error}</div>
      )}

      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-wider">Sponsors List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-muted-foreground flex items-center justify-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading sponsors...
            </div>
          ) : sponsors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sponsors added yet.</p>
          ) : (
            <div className="space-y-2">
              {sponsors.map((s) => (
                <div key={s.id} className="p-3 rounded-lg border border-border bg-muted/20 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">{s.tier}</p>
                    {s.websiteUrl && <p className="text-[11px] text-primary truncate">{s.websiteUrl}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      className="w-20 h-8"
                      value={s.displayOrder}
                      onChange={(e) => {
                        const value = Math.max(0, Number(e.target.value) || 0);
                        setSponsors((prev) => prev.map((x) => (x.id === s.id ? { ...x, displayOrder: value } : x)));
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => patchSponsor(s.id, { displayOrder: s.displayOrder })}
                      disabled={saving === s.id}
                    >
                      Save
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className={s.isVisible ? "text-primary" : "text-muted-foreground"}
                      onClick={() => patchSponsor(s.id, { isVisible: !s.isVisible })}
                      disabled={saving === s.id}
                      title={s.isVisible ? "Hide from homepage" : "Show on homepage"}
                    >
                      {s.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeSponsor(s.id)}
                      disabled={saving === s.id + "_delete"}
                      title="Delete sponsor"
                    >
                      {saving === s.id + "_delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
