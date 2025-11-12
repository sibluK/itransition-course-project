import { useDiscussionPosts } from "@/hooks/useDiscussionPosts";
import type { DiscussionPost } from "@/types/models";
import { useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";

export default function Discussions() {
    const { inventoryId } = useParams<{ inventoryId: string }>();
    const [isAddingPost, setIsAddingPost] = useState(false);
    const { 
        data, 
        isLoading, 
        error, 
        addDiscussionPost, 
        removeDiscussionPost 
    } = useDiscussionPosts(Number(inventoryId));
    const { t } = useTranslation();

    const onSubmitNewPost = async (content: string) => {
        await addDiscussionPost(content);
        setIsAddingPost(false);
    }

    return (
        <div className="px-1">
            <Button 
                variant="default"
                onClick={() => setIsAddingPost(!isAddingPost)}
            >
                <Plus/>
                {t("button-post")}
            </Button>
            {isAddingPost && 
                <AddDiscussionPostForm 
                    onSubmit={onSubmitNewPost} 
                    onCancel={() => setIsAddingPost(false)}
                />
            }
            <Separator className="my-3"/>
            {data && 
                <DiscussionPostList 
                    posts={data} 
                    isLoading={isLoading} 
                    error={error} 
                    removeDiscussionPost={removeDiscussionPost}
                />
            }
        </div>
    );
}

interface AddDiscussionPostFormProps {
    onSubmit: (content: string) => Promise<void>;
    onCancel: () => void;
}

function AddDiscussionPostForm({ onSubmit, onCancel }: AddDiscussionPostFormProps) {
    const { t } = useTranslation();
    const [content, setContent] = useState("");

    const handleSubmit = async () => {
        await onSubmit(content);
        setContent("");
    }

    return (
        <div className="mt-3">
            <MDEditor 
                value={content} 
                onChange={(value) => setContent(value || "")} 
                height={250} 
                className="rounded-md"
                data-color-mode="dark"
            />
            <Button 
                onClick={handleSubmit} 
                disabled={!content.trim()}
                className="mt-3"
            >
                {t("button-submit")}
            </Button>
            <Button 
                variant="outline" 
                onClick={onCancel}
                className="mt-3 ml-2"
            >
                {t("button-cancel")}
            </Button>
        </div>
    );
}

interface DiscussionPostListProps {
    posts: DiscussionPost[];
    isLoading: boolean;
    error: Error | null;
    removeDiscussionPost: (postId: number) => Promise<void>;
}

function DiscussionPostList({ posts, removeDiscussionPost, isLoading, error }: DiscussionPostListProps) {
    const { t } = useTranslation();

    if (isLoading) {
        return <Spinner className="w-[50px] h-[50px] mx-auto my-10"/>
    }

    if (error) {
        return <div className="text-red-500">Could not load discussion posts. Try again later...</div>;
    }
    
    return (
        <div className="flex flex-col">
            <h2 className="text-xl font-bold mb-3">{t("discussion-header", { post_count: posts.length})}</h2>
            {posts.map(post => (
                <DiscussionPost
                    key={post.id}
                    post={post}
                    removeDiscussionPost={removeDiscussionPost}
                />
            ))}
        </div>
    );
}

interface DiscussionPostProps {
    post: DiscussionPost;
    removeDiscussionPost: (postId: number) => Promise<void>;
}

function DiscussionPost({ post, removeDiscussionPost }: DiscussionPostProps) {
    const { userId } = useAuth();
    const isPostOwner = userId === post.userId;

    const handleRemovePost = async () => {
        await removeDiscussionPost(post.id);
    }

    return (
        <div key={post.id} className="rounded mb-10">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-tl rounded-tr">
                <img 
                    src={post.userImageUrl || undefined} 
                    alt={post.userEmail} 
                    className="w-9 h-9 rounded-full inline-block mr-2" 
                />
                <div className="flex flex-col">
                    <span>{post.userEmail}</span>
                    <span className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</span>
                </div>
                {isPostOwner && (
                    <Button 
                        variant="destructive"
                        size="sm"
                        className="ml-auto"
                        onClick={handleRemovePost}
                    >
                        <Trash />
                    </Button>
                )}
            </div>
            <div className="p-2">
                <ReactMarkdown>
                    {post.content}
                </ReactMarkdown>
            </div>
        </div>
    );
}