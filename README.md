# 🧠 Multi-Agent Research Assistant

An AI-powered research system built with **Agno**, **Groq**, **DuckDuckGo**, and **Arxiv** that automates the complete research workflow—from information gathering to report generation.

---

## ✨ Features

* 🔍 Web Search using DuckDuckGo
* 📚 Academic Paper Retrieval via Arxiv
* ✍️ Automatic Summarization
* ✅ Fact Verification
* 📄 Professional Report Generation
* 📥 Download Reports as Markdown
* 📈 Interactive Analytics Dashboard
* 🕒 Query History Tracking
* ⚡ Powered by Groq LLMs

---

## 🏗️ Architecture

```text
User Query
    │
    ▼
Research Agent
(Web + Arxiv Search)
    │
    ▼
Summarizer Agent
    │
    ▼
Fact Checker Agent
    │
    ▼
Writer Agent
    │
    ▼
Final Research Report
```

---

## 🛠️ Tech Stack

* Python
* Streamlit
* Agno
* Groq API
* DuckDuckGo Tools
* Arxiv Tools
* Pandas
* NumPy

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/Riyanshu-07/multi-agent-research-assistant.git

cd multi-agent-research-assistant
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it:

### Mac/Linux

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

Create a `.env` file:

```env
GROQ_API_KEY=your_api_key_here
```

---

## 🚀 Run the Application

```bash
streamlit run main.py
```

Open:

```text
http://localhost:8501
```

---

## 🤖 Agents

### 🔍 Research Agent

Responsible for collecting information from:

* DuckDuckGo
* Arxiv

### ✍️ Summarizer Agent

Generates concise summaries and extracts key findings.

### ✅ Fact Checker Agent

Verifies claims and improves reliability.

### 📄 Writer Agent

Produces a professional research report including:

* Introduction
* Findings
* Insights
* Conclusion
* References

---

## 📊 Dashboard Features

* Confidence Score Slider
* Research Metrics
* Analytics Visualization
* Search History
* Report Download

---

## Example Research Topics

* Agentic AI
* Retrieval-Augmented Generation
* Large Language Models
* Autonomous Agents
* AI Safety
* Multi-Agent Systems

---

## Future Improvements

* PDF Export
* Citation Support
* Multi-Document RAG
* Vector Database Integration
* Persistent Memory
* Multi-LLM Support
* Research Paper Ranking

---

## 📸 Preview

Add screenshots of your application here.

```text
assets/demo.png
```

---

## Contributing

Contributions are welcome.

Feel free to open issues or submit pull requests.

---

## License

MIT License

---

## Author

**Riyanshu**

Aspiring AI/ML Engineer passionate about building intelligent systems, Agentic AI applications, and Generative AI solutions.

GitHub: https://github.com/Riyanshu-07
