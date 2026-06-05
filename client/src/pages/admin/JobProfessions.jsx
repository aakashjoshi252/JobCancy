import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Layers3 } from "lucide-react";
import { adminApi } from "../../api/api";

export default function JobProfessions() {
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const response = await adminApi.get("/job-professions");
        setProfessions(response.data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load job professions");
      } finally {
        setLoading(false);
      }
    };

    fetchProfessions();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Job Professions</h1>
        <p className="mt-2 text-gray-600">Taxonomy coverage across published and moderated jobs.</p>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        ) : professions.length === 0 ? (
          <div className="p-12 text-center">
            <Layers3 className="mx-auto mb-4 h-14 w-14 text-gray-300" />
            <p className="font-semibold text-gray-900">No professions are in use yet</p>
          </div>
        ) : (
          <div className="grid gap-px bg-gray-100 sm:grid-cols-2 xl:grid-cols-3">
            {professions.map((item) => (
              <div key={item.profession} className="bg-white p-5">
                <p className="font-semibold text-gray-900">{item.profession}</p>
                <p className="mt-2 text-sm text-gray-500">{item.jobs} job posts</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
