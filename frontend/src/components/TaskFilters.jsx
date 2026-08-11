export default function TaskFilters({
    search,
    setSearch,
}) {

    return (
        <div className="task-filters">

            <div className="search-box">

                <span>
                    🔍
                </span>

                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                />

                {search && (
                    <button
                        type="button"
                        onClick={() =>
                            setSearch("")
                        }
                    >
                        ×
                    </button>
                )}

            </div>

            <button
                type="button"
                className="filter-button"
            >
                All tasks
                <span>⌄</span>
            </button>

            <button
                type="button"
                className="filter-button"
            >
                Priority
                <span>⌄</span>
            </button>

        </div>
    );
}