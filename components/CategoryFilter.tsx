"use client";

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <div className="mt-20 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <h3 className="text-2xl font-bold text-white tracking-tight">Latest Articles</h3>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <button
                    onClick={() => onSelectCategory("All")}
                    className={`flex-shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors ${selectedCategory === "All"
                            ? "bg-blue-600 text-white"
                            : "bg-transparent text-slate-300 hover:text-white"
                        }`}
                >
                    All
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onSelectCategory(category)}
                        className={`flex-shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors ${selectedCategory === category
                                ? "bg-blue-600 text-white"
                                : "bg-transparent text-slate-300 hover:text-white"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
