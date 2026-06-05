import { useEffect, useState } from "react";
import { chatApi } from "../../api/api";
import { useSelector } from "react-redux";
import { HiSearch, HiArrowLeft, HiUserAdd, HiCheckCircle } from "react-icons/hi";
import UserAvatar from "../ui/UserAvatar";
import { useTranslation } from "react-i18next";

const AvailableCandidates = ({ onSelectCandidate, onBack }) => {
  const { t } = useTranslation(["chat", "common"]);
  const [candidates, setCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const peerLabel =
    user?.role === "candidate"
      ? t("roles.recruiter", { ns: "common" }).toLowerCase()
      : t("roles.candidate", { ns: "common" }).toLowerCase();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await chatApi.get("/candidates/available");
        setCandidates(response.data.candidates || []);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchCandidates();
    }
  }, [user]);

  const handleSelectCandidate = async (candidate) => {
    setSelectedCandidate(candidate);
    
    try {
      // Create or get chat with this candidate
      const response = await chatApi.post("/create", {
        participantId: candidate._id,
      });
      
      onSelectCandidate(response.data.chat);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-6 bg-gradient-to-r from-[#1A3D63] to-[#1e4d7a]">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
          >
            <HiArrowLeft className="text-white text-xl" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <HiUserAdd className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{t("newChat")}</h2>
              <p className="text-blue-100 text-sm mt-0.5">
                {t("selectPeerToStart", { role: peerLabel })}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder={t("searchPeers", { role: peerLabel })}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-0 bg-white/95 focus:bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Candidates List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-gray-600 font-medium">{t("loadingPeers", { role: peerLabel })}</p>
            </div>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <HiUserAdd className="text-gray-400 text-5xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {searchQuery ? t("noPeerFound", { role: peerLabel }) : t("noPeerAvailable", { role: peerLabel })}
            </h3>
            <p className="text-gray-500 text-sm max-w-xs">
              {searchQuery 
                ? t("tryDifferentSearch") 
                : t("noPeerAvailable", { role: peerLabel })}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate._id}
                onClick={() => handleSelectCandidate(candidate)}
                className="flex items-center gap-4 px-5 py-4 cursor-pointer bg-white hover:bg-blue-50 transition-all duration-200 group"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <UserAvatar user={candidate} className="h-14 w-14 text-lg shadow-md transition-shadow group-hover:shadow-lg" />
                </div>

                {/* Candidate Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {candidate.username}
                      </p>
                      {candidate.verified && (
                        <HiCheckCircle className="text-blue-600 text-base flex-shrink-0" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate">
                    {candidate.fullName || candidate.email}
                  </p>
                  
                  <div className="mt-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                      {user?.role === "candidate"
                        ? t("roles.recruiter", { ns: "common" })
                        : t("roles.candidate", { ns: "common" })}
                    </span>
                  </div>
                </div>

                {/* Start Chat Button */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">
                    <HiUserAdd className="text-sm" />
                    <span>{t("title")}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableCandidates;
