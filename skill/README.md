# Dynatrace SRE Skill for GitHub Copilot

An AI-powered Site Reliability Engineering (SRE) toolkit for Dynatrace. This repository contains custom rules, structured playbooks, and production-ready DQL templates to teach GitHub Copilot how to act as an expert Dynatrace SRE.

---

## 🚀 How It Works

GitHub Copilot automatically loads instructions from the `.github/` folder in your workspace root.
1. **Persona Injection:** When you open this repository in VS Code, Cursor, or GitHub, Copilot Chat reads [.github/copilot-instructions.md](file:///.github/copilot-instructions.md) to adopt a Senior Dynatrace SRE persona.
2. **Contextual Knowledge:** Copilot uses the queries, templates, and guides in [dynatrace-sre-playbook.md](file:///dynatrace-sre-playbook.md) to answer your troubleshooting requests with syntax-exact, performance-optimized, and production-ready solutions.

---

## 📂 Repository Structure

- [`.github/copilot-instructions.md`](file:///.github/copilot-instructions.md): System instructions for GitHub Copilot, setting the SRE persona, optimization rules, and platform constraints.
- [`dynatrace-sre-playbook.md`](file:///dynatrace-sre-playbook.md): The core reference manual, covering:
  - **DQL Recipes:** CPU/Memory correlation, database pool starvation, serverless outages, and trace bottlenecks.
  - **Dynamic Dashboards:** Dynamic header variables and SLO calculation logic.
  - **Automated Workflows:** Jinja templates for Email, ServiceNow ITSM incidents, and Event-Driven Ansible (EDA) webhook structures, plus custom SDK Javascript tasks.

---

## 💬 Example Prompts to Ask Copilot

Once you have opened this repository in VS Code (with GitHub Copilot enabled), open Copilot Chat and try these prompts:

### 🔍 DQL Telemetry & Correlation
> "Create a DQL query to list the top 10 containers in my Kubernetes cluster experiencing Memory spikes in the last 2 hours. Join them with any ERROR log lines they printed."

> "Show me how to lookup process group details for database spans that exceed a duration of 5 seconds."

### 📊 SLOs & Dashboards
> "How can I set up a dynamic dashboard variable for AWS EC2 instances, and then write a DQL query for a line chart tile that filters by that instance variable?"

> "Write a DQL query to calculate the 95th percentile response time for my service, and explain how to configure it as a dashboard tile."

### ⚙️ Automation Workflows (EDA, ServiceNow, Email)
> "I need a Jinja template for a Dynatrace Workflow email task that displays a table of slow SQL statements returned by my previous DQL query task."

> "Write the JSON webhook payload to trigger Event-Driven Ansible (EDA) with VM parameters when CPU usage exceeds 95%."

> "Create a custom JavaScript step for a Dynatrace Workflow that queries Grail logs using `@dynatrace-sdk/client-query` to fetch the count of 5xx HTTP statuses."

---

## 🛠️ Customization

To tailor the SRE skill to your specific company stack:
1. Open [`dynatrace-sre-playbook.md`](file:///dynatrace-sre-playbook.md) and add your custom metric names, log patterns, or naming standards.
2. Update [`.github/copilot-instructions.md`](file:///.github/copilot-instructions.md) if you want Copilot to enforce specific query buckets, database naming schemes, or cloud regions.
