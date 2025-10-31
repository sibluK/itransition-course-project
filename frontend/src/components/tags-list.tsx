interface TagsListProps {
    tags: string[];
    handleRemoveTag: (tagName: string) => void;
}

export function TagsList({ tags, handleRemoveTag }: TagsListProps) {
    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tagName) => (
                <span
                    key={tagName}
                    className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                    onClick={() => handleRemoveTag(tagName)}
                >
                    {tagName}
                </span>
            ))}
        </div>
    );
}