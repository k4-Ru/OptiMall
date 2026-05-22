import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Vote,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const initialAuthForm = { username: "", password: "", phone: "", address: "", role: "voter" };
const initialElectionForm = { title: "", description: "", start_date: "", end_date: "" };
const initialCandidateForm = { election_id: "", name: "", position: "" };

function decodeToken(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function toMysqlDate(value) {
  return value ? `${value.replace("T", " ")}:00` : "";
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("voting_token") || "");
  const [role, setRole] = useState(() => localStorage.getItem("voting_role") || "");
  const [profile, setProfile] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [profileForm, setProfileForm] = useState({ phone: "", address: "" });
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [voteHistory, setVoteHistory] = useState([]);
  const [voteCounts, setVoteCounts] = useState([]);
  const [turnout, setTurnout] = useState([]);
  const [adminVotes, setAdminVotes] = useState([]);
  const [electionForm, setElectionForm] = useState(initialElectionForm);
  const [candidateForm, setCandidateForm] = useState(initialCandidateForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const tokenPayload = useMemo(() => decodeToken(token), [token]);
  const isAdmin = role === "admin" || tokenPayload?.role === "admin";

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    if (!response.ok || data.error) {
      throw new Error(data.error || data.message || "Request failed.");
    }
    return data;
  }

  function showSuccess(text) {
    setMessage(text);
    setError("");
  }

  function showError(err) {
    setError(err.message || "Something went wrong.");
    setMessage("");
  }

  async function loadProfile() {
    if (!token) return;
    const data = await api("/users/profile", { method: "GET" });
    setProfile(data);
    setRole(data.role);
    localStorage.setItem("voting_role", data.role);
    setProfileForm({ phone: data.phone || "", address: data.address || "" });
    return data;
  }

  async function loadElections() {
    if (!token) return;
    const data = await api("/elections", { method: "GET" });
    setElections(Array.isArray(data) ? data : []);
    if (!selectedElection && Array.isArray(data) && data[0]) {
      setSelectedElection(String(data[0].id));
      setCandidateForm((current) => ({ ...current, election_id: String(data[0].id) }));
    }
  }

  async function loadCandidates(electionId = selectedElection) {
    if (!token || !electionId) {
      setCandidates([]);
      return;
    }
    const data = await api(`/candidates/${electionId}`, { method: "GET" });
    setCandidates(Array.isArray(data) ? data : []);
    setSelectedCandidate("");
  }

  async function loadVoteHistory(userId = profile?.id) {
    if (!token || !userId) return;
    const data = await api(`/votes/user/${userId}`, { method: "GET" });
    setVoteHistory(Array.isArray(data) ? data : []);
  }

  async function loadAdminData() {
    if (!token || !isAdmin) return;
    const [counts, turnoutData, votes] = await Promise.all([
      api("/reports/vote-count", { method: "GET" }),
      api("/reports/turnout", { method: "GET" }),
      api("/admin/votes", { method: "GET" }),
    ]);
    setVoteCounts(Array.isArray(counts) ? counts : []);
    setTurnout(Array.isArray(turnoutData) ? turnoutData : []);
    setAdminVotes(Array.isArray(votes) ? votes : []);
  }

  async function refreshAll() {
    if (!token) return;
    setLoading(true);
    try {
      const freshProfile = await loadProfile();
      await loadElections();
      await loadCandidates(selectedElection);
      await loadVoteHistory(freshProfile?.id || profile?.id);
      await loadAdminData();
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    loadCandidates(selectedElection).catch(showError);
    if (selectedElection) {
      setCandidateForm((current) => ({ ...current, election_id: selectedElection }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElection]);

  async function handleAuth(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const payload =
        authMode === "login"
          ? { username: authForm.username, password: authForm.password }
          : authForm;
      const data = await api(`/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (authMode === "register") {
        showSuccess(data.message || "Registered successfully.");
        setAuthMode("login");
        setAuthForm((current) => ({ ...initialAuthForm, username: current.username }));
        return;
      }

      localStorage.setItem("voting_token", data.token);
      localStorage.setItem("voting_role", data.role);
      setToken(data.token);
      setRole(data.role);
      showSuccess(data.message || "Login successful.");
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await api("/users/profile", {
        method: "PUT",
        body: JSON.stringify(profileForm),
      });
      showSuccess(data.message || "Profile updated.");
      await loadProfile();
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }

  async function castVote(event) {
    event.preventDefault();
    if (!selectedElection || !selectedCandidate) {
      showError(new Error("Please choose an election and candidate."));
      return;
    }
    setLoading(true);
    try {
      const data = await api("/votes/cast", {
        method: "POST",
        body: JSON.stringify({
          election_id: Number(selectedElection),
          candidate_id: Number(selectedCandidate),
        }),
      });
      showSuccess(data.message || "Vote cast successfully.");
      await loadVoteHistory(profile?.id);
      await loadAdminData();
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }

  async function createElection(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await api("/elections", {
        method: "POST",
        body: JSON.stringify({
          ...electionForm,
          start_date: toMysqlDate(electionForm.start_date),
          end_date: toMysqlDate(electionForm.end_date),
        }),
      });
      showSuccess(data.message || "Election created.");
      setElectionForm(initialElectionForm);
      await loadElections();
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }

  async function createCandidate(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await api("/candidates", {
        method: "POST",
        body: JSON.stringify({
          ...candidateForm,
          election_id: Number(candidateForm.election_id),
        }),
      });
      showSuccess(data.message || "Candidate added.");
      setCandidateForm((current) => ({ election_id: current.election_id, name: "", position: "" }));
      await loadCandidates(candidateForm.election_id);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("voting_token");
    localStorage.removeItem("voting_role");
    setToken("");
    setRole("");
    setProfile(null);
    setElections([]);
    setCandidates([]);
    setVoteHistory([]);
    showSuccess("Logged out.");
  }

  if (!token) {
    return (
      <main className="auth-shell">
        <section className="auth-panel">
          <div>
            <p className="eyebrow">Final Voting System</p>
            <h1>{authMode === "login" ? "Sign in" : "Create account"}</h1>
          </div>

          <div className="segmented">
            <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>
              Login
            </button>
            <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="form-grid">
            <label>
              Username
              <input
                value={authForm.username}
                onChange={(event) => setAuthForm({ ...authForm, username: event.target.value })}
                minLength={4}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                minLength={8}
                required
              />
            </label>

            {authMode === "register" && (
              <>
                <label>
                  Phone
                  <input
                    value={authForm.phone}
                    onChange={(event) => setAuthForm({ ...authForm, phone: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Address
                  <input
                    value={authForm.address}
                    onChange={(event) => setAuthForm({ ...authForm, address: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Role
                  <select
                    value={authForm.role}
                    onChange={(event) => setAuthForm({ ...authForm, role: event.target.value })}
                  >
                    <option value="voter">Voter</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </>
            )}

            <button className="primary" disabled={loading}>
              {authMode === "login" ? <ShieldCheck size={18} /> : <UserPlus size={18} />}
              {loading ? "Please wait" : authMode === "login" ? "Login" : "Register"}
            </button>
          </form>

          <Status message={message} error={error} />
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Final Voting System</p>
          <h1>{profile?.username || tokenPayload?.username || "Dashboard"}</h1>
        </div>
        <div className="topbar-actions">
          <span className="role-pill">{isAdmin ? "Admin" : "Voter"}</span>
          <button className="icon-button" onClick={refreshAll} disabled={loading} title="Refresh data">
            <RefreshCw size={18} />
          </button>
          <button className="icon-button danger" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <Status message={message} error={error} />

      <section className="layout">
        <div className="main-column">
          <Panel title="Elections" action={`${elections.length} total`}>
            <div className="election-list">
              {elections.length === 0 && <p className="empty">No elections found.</p>}
              {elections.map((election) => (
                <button
                  key={election.id}
                  className={`election-item ${String(election.id) === selectedElection ? "selected" : ""}`}
                  onClick={() => setSelectedElection(String(election.id))}
                >
                  <span>
                    <strong>{election.title}</strong>
                    <small>{election.description || "No description"}</small>
                  </span>
                  <small>{election.start_date} to {election.end_date}</small>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Cast Vote" action={selectedElection ? `Election #${selectedElection}` : ""}>
            <form onSubmit={castVote} className="vote-area">
              <div className="candidate-grid">
                {candidates.length === 0 && <p className="empty">No candidates for this election.</p>}
                {candidates.map((candidate) => (
                  <label className="candidate-option" key={candidate.id}>
                    <input
                      type="radio"
                      name="candidate"
                      value={candidate.id}
                      checked={String(candidate.id) === selectedCandidate}
                      onChange={(event) => setSelectedCandidate(event.target.value)}
                    />
                    <span>
                      <strong>{candidate.name}</strong>
                      <small>{candidate.position}</small>
                    </span>
                  </label>
                ))}
              </div>
              <button className="primary" disabled={loading || !selectedElection || !selectedCandidate}>
                <Vote size={18} />
                Submit Vote
              </button>
            </form>
          </Panel>

          <Panel title="My Vote History" action={`${voteHistory.length} records`}>
            <DataTable
              rows={voteHistory}
              columns={[
                ["election_title", "Election"],
                ["candidate_name", "Candidate"],
                ["position", "Position"],
                ["timestamp", "Date"],
              ]}
            />
          </Panel>
        </div>

        <aside className="side-column">
          <Panel title="Profile">
            <form onSubmit={updateProfile} className="form-grid compact">
              <label>
                Phone
                <input
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })}
                  required
                />
              </label>
              <label>
                Address
                <input
                  value={profileForm.address}
                  onChange={(event) => setProfileForm({ ...profileForm, address: event.target.value })}
                  required
                />
              </label>
              <button className="secondary" disabled={loading}>
                <CheckCircle2 size={18} />
                Save Profile
              </button>
            </form>
          </Panel>

          {isAdmin && (
            <>
              <Panel title="Create Election">
                <form onSubmit={createElection} className="form-grid compact">
                  <label>
                    Title
                    <input
                      value={electionForm.title}
                      onChange={(event) => setElectionForm({ ...electionForm, title: event.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={electionForm.description}
                      onChange={(event) => setElectionForm({ ...electionForm, description: event.target.value })}
                    />
                  </label>
                  <label>
                    Start
                    <input
                      type="datetime-local"
                      value={electionForm.start_date}
                      onChange={(event) => setElectionForm({ ...electionForm, start_date: event.target.value })}
                      required
                    />
                  </label>
                  <label>
                    End
                    <input
                      type="datetime-local"
                      value={electionForm.end_date}
                      onChange={(event) => setElectionForm({ ...electionForm, end_date: event.target.value })}
                      required
                    />
                  </label>
                  <button className="primary" disabled={loading}>
                    <Plus size={18} />
                    Add Election
                  </button>
                </form>
              </Panel>

              <Panel title="Add Candidate">
                <form onSubmit={createCandidate} className="form-grid compact">
                  <label>
                    Election
                    <select
                      value={candidateForm.election_id}
                      onChange={(event) => setCandidateForm({ ...candidateForm, election_id: event.target.value })}
                      required
                    >
                      <option value="">Select election</option>
                      {elections.map((election) => (
                        <option key={election.id} value={election.id}>
                          {election.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Candidate
                    <input
                      value={candidateForm.name}
                      onChange={(event) => setCandidateForm({ ...candidateForm, name: event.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Position
                    <input
                      value={candidateForm.position}
                      onChange={(event) => setCandidateForm({ ...candidateForm, position: event.target.value })}
                      required
                    />
                  </label>
                  <button className="secondary" disabled={loading}>
                    <UserPlus size={18} />
                    Add Candidate
                  </button>
                </form>
              </Panel>
            </>
          )}
        </aside>
      </section>

      {isAdmin && (
        <section className="admin-section">
          <Panel title="Vote Count" action={<BarChart3 size={18} />}>
            <DataTable
              rows={voteCounts}
              columns={[
                ["election_title", "Election"],
                ["candidate_name", "Candidate"],
                ["position", "Position"],
                ["total_votes", "Votes"],
              ]}
            />
          </Panel>
          <Panel title="Turnout">
            <DataTable
              rows={turnout}
              columns={[
                ["election", "Election"],
                ["users_voted", "Voted"],
                ["total_users", "Voters"],
                ["turnout_percentage", "Turnout"],
              ]}
            />
          </Panel>
          <Panel title="All Votes">
            <DataTable
              rows={adminVotes}
              columns={[
                ["id", "ID"],
                ["user_id", "User"],
                ["election_id", "Election"],
                ["candidate_id", "Candidate"],
                ["timestamp", "Date"],
              ]}
            />
          </Panel>
        </section>
      )}
    </main>
  );
}

function Status({ message, error }) {
  if (!message && !error) return null;
  return <div className={`status ${error ? "error" : "success"}`}>{error || message}</div>;
}

function Panel({ title, action, children }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        {action && <span>{action}</span>}
      </div>
      {children}
    </section>
  );
}

function DataTable({ rows, columns }) {
  if (!rows.length) return <p className="empty">No data yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map(([, label]) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || `${row.election || row.election_title}-${index}`}>
              {columns.map(([key]) => (
                <td key={key}>{row[key] ?? "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
