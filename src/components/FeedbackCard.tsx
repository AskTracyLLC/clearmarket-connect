type FeedbackCardProps = {
  feedback: {
    id: string;
    title: string;
    description: string;
    status: string;
    type: string;
    author: string;
    created_at: string;
    upvotes: number;
    comments_count: number;
  };
};

const FeedbackCard = ({ feedback }: FeedbackCardProps) => {
  return (
    <div className="border rounded-lg p-4 bg-background shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground">{feedback.type}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground">
          {feedback.status}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-1">{feedback.title}</h3>
      <p className="text-sm text-muted-foreground mb-2">{feedback.description}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Posted by {feedback.author}</span>
        <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
      </div>
      <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
        <span>👍 {feedback.upvotes}</span>
        <span>💬 {feedback.comments_count}</span>
      </div>
    </div>
  );
};

export default FeedbackCard;
