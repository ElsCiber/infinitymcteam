import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    email: string;
  };
}

interface EventReviewsProps {
  eventId: string;
}

export const EventReviews = ({ eventId }: EventReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
    checkCanReview();
  }, [eventId]);

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from("event_reviews")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading reviews:", error);
      return;
    }

    if (data) {
      // Fetch user emails separately
      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      const reviewsWithProfiles = data.map(review => ({
        ...review,
        profiles: profiles?.find(p => p.id === review.user_id) || { email: "Usuario desconocido" }
      }));

      setReviews(reviewsWithProfiles);
    }
  };

  const checkCanReview = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user attended the event
    const { data: registration } = await supabase
      .from("event_registrations")
      .select("attended")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .single();

    if (registration?.attended) {
      setCanReview(true);

      // Check if user already reviewed
      const { data: existingReview } = await supabase
        .from("event_reviews")
        .select("id, rating, comment")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single();

      if (existingReview) {
        setHasReviewed(true);
        setRating(existingReview.rating);
        setComment(existingReview.comment || "");
      }
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona una calificación",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (hasReviewed) {
      // Update existing review
      const { error } = await supabase
        .from("event_reviews")
        .update({ rating, comment })
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar la reseña",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Reseña actualizada!",
          description: "Tu reseña ha sido actualizada correctamente",
        });
        loadReviews();
      }
    } else {
      // Create new review
      const { error } = await supabase
        .from("event_reviews")
        .insert({ event_id: eventId, user_id: user.id, rating, comment });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo enviar la reseña",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Reseña enviada!",
          description: "Gracias por tu feedback",
        });
        setHasReviewed(true);
        loadReviews();
      }
    }
    setLoading(false);
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= currentRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Valoraciones y Comentarios</CardTitle>
          <div className="flex items-center gap-2">
            {renderStars(Math.round(parseFloat(averageRating)))}
            <span className="text-lg font-semibold">{averageRating}</span>
            <span className="text-muted-foreground">
              ({reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"})
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {canReview && (
            <div className="space-y-4 mb-6 p-4 border rounded-lg bg-accent/50">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tu calificación
                </label>
                {renderStars(rating, true)}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Comentario (opcional)
                </label>
                <Textarea
                  placeholder="Comparte tu experiencia..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>
              <Button onClick={handleSubmit} disabled={loading}>
                {hasReviewed ? "Actualizar reseña" : "Enviar reseña"}
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {renderStars(review.rating)}
                    <p className="text-sm text-muted-foreground mt-1">
                      {review.profiles.email}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
                {review.comment && (
                  <p className="text-sm mt-2">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
