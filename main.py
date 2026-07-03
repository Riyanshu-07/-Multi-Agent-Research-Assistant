from dotenv import load_dotenv
from agno.agent import Agent
from agno.models.groq import Groq
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.arxiv import ArxivTools

import streamlit as st
import pandas as pd
import numpy as np

load_dotenv()

MODEL_ID = "meta-llama/llama-4-scout-17b-16e-instruct"

st.set_page_config(
    page_title="Multi-Agent Research Assistant",
    page_icon="🧠",
    layout="wide"
)

# ---------------------------------------------------
# AGENTS
# ---------------------------------------------------

research_agent = Agent(
    name="Research Agent",
    tools=[DuckDuckGoTools(), ArxivTools()],
    role="""
    Collect useful information.
    Search web and arxiv.
    Gather important findings.
    """,
    model=Groq(id=MODEL_ID),
    markdown=True
)

summarize_agent = Agent(
    name="Summarizer",
    role="""
    Produce concise summaries.
    Highlight key insights.
    """,
    model=Groq(id=MODEL_ID),
    markdown=True
)

checker_agent = Agent(
    name="Fact Checker",
    role="""
    Verify information.
    Detect unsupported claims.
    Improve accuracy.
    """,
    model=Groq(id=MODEL_ID),
    markdown=True
)

writer_agent = Agent(
    name="Writer",
    role="""
    Generate a professional report.

    Include:

    Introduction

    Findings

    Insights

    Conclusion

    References
    """,
    model=Groq(id=MODEL_ID),
    markdown=True
)

# ---------------------------------------------------
# SIDEBAR
# ---------------------------------------------------

st.sidebar.title("⚙ Settings")

st.sidebar.info(
    """
    **Agents Used**

    🔍 Research Agent

    ✍ Summarizer

    ✅ Fact Checker

    📄 Writer
    """
)

show_research = st.sidebar.checkbox(
    "Show Research Output",
    True
)

show_summary = st.sidebar.checkbox(
    "Show Summary",
    True
)

show_checker = st.sidebar.checkbox(
    "Show Fact Check",
    True
)

# ---------------------------------------------------
# HEADER
# ---------------------------------------------------

st.title("🧠 Multi-Agent Research Assistant")

st.caption(
    "Powered by Groq + Agno + Arxiv + DuckDuckGo"
)

query = st.text_input(
    "Research Topic",
    placeholder="Agentic AI"
)

# ---------------------------------------------------
# SESSION STATE
# ---------------------------------------------------

if "history" not in st.session_state:
    st.session_state.history = []

# ---------------------------------------------------
# BUTTON
# ---------------------------------------------------

if st.button("🚀 Generate Report"):

    if query:

        progress = st.progress(0)

        status = st.empty()

        status.info("🔍 Researching")

        research = research_agent.run(query)

        progress.progress(25)

        status.info("✍ Summarizing")

        summary = summarize_agent.run(

            f"""
            Summarize:

            {research.content}
            """

        )

        progress.progress(50)

        status.info("✅ Fact Checking")

        checked = checker_agent.run(

            f"""
            Verify:

            {summary.content}
            """

        )

        progress.progress(75)

        status.info("📄 Writing Report")

        report = writer_agent.run(

            f"""
            Create professional report:

            {checked.content}
            """

        )

        progress.progress(100)

        status.success("Completed")

        st.session_state.history.append(query)

        # Metrics

        c1, c2, c3 = st.columns(3)

        c1.metric(
            "Topic Length",
            len(query)
        )

        c2.metric(
            "Research Size",
            len(research.content)
        )

        c3.metric(
            "Report Size",
            len(report.content)
        )

        tabs = st.tabs([

            "📚 Research",

            "📝 Summary",

            "✅ Verification",

            "📄 Final Report"

        ])

        if show_research:
            with tabs[0]:
                st.markdown(research.content)

        if show_summary:
            with tabs[1]:
                st.markdown(summary.content)

        if show_checker:
            with tabs[2]:
                st.markdown(checked.content)

        with tabs[3]:

            st.markdown(report.content)

            st.download_button(

                label="⬇ Download Report",

                data=report.content,

                file_name="research_report.md",

                mime="text/markdown"

            )

# ---------------------------------------------------
# HISTORY
# ---------------------------------------------------

if st.session_state.history:

    st.sidebar.divider()

    st.sidebar.subheader("🕒 History")

    for item in reversed(st.session_state.history[-10:]):

        st.sidebar.write("•", item)

# ---------------------------------------------------
# ANALYTICS
# ---------------------------------------------------

st.divider()

st.subheader("📈 Analytics")

chart_data = pd.DataFrame(

    np.random.randn(30,3),

    columns=["Research","Summary","Report"]

)

st.line_chart(chart_data)

x = st.slider(

    "Confidence Score",

    0,

    100,

    75

)

st.write(

    f"AI Confidence: **{x}%**"

)