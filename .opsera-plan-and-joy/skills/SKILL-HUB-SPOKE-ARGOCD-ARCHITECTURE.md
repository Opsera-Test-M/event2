# ═══════════════════════════════════════════════════════════════════════════════
# OPSERA SKILL: Hub-Spoke ArgoCD Architecture for EKS
# ═══════════════════════════════════════════════════════════════════════════════
# Version: 1.0.0
# Category: devops
# Tags: kubernetes, eks, argocd, hub-spoke, gitops, aws, cluster-management
# Severity: CRITICAL
# Skill ID: HUB-SPOKE-001
# ═══════════════════════════════════════════════════════════════════════════════

## 📋 Executive Summary

This skill addresses critical issues in hub-spoke Kubernetes architectures where:
- **Hub Cluster**: Runs ArgoCD for GitOps management
- **Spoke Cluster(s)**: Run application workloads

Failure to properly configure cluster contexts leads to:
- "Unknown" sync status in ArgoCD
- Resources created on wrong cluster
- DNS/ingress discovery failures
- Deployment verification failures

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         HUB-SPOKE ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌─────────────────────────────┐          ┌─────────────────────────────┐      │
│   │     HUB CLUSTER             │          │     SPOKE CLUSTER           │      │
│   │     (argocd-usw2)           │          │     (opsera-usw2-np)        │      │
│   │                             │          │                             │      │
│   │  ┌───────────────────┐      │   GitOps │  ┌───────────────────┐      │      │
│   │  │     ArgoCD        │──────┼──────────┼──│   Applications    │      │      │
│   │  │                   │      │   Sync   │  │                   │      │      │
│   │  │  - Applications   │      │          │  │  - Deployments    │      │      │
│   │  │  - Repo Secrets   │      │          │  │  - Services       │      │      │
│   │  │  - Cluster Secrets│      │          │  │  - Ingress        │      │      │
│   │  └───────────────────┘      │          │  │  - ConfigMaps     │      │      │
│   │                             │          │  └───────────────────┘      │      │
│   │  ┌───────────────────┐      │          │                             │      │
│   │  │  Webhooks/Policies│      │          │  ┌───────────────────┐      │      │
│   │  │  (may differ from │      │          │  │  Ingress Controller│     │      │
│   │  │   spoke config)   │      │          │  │  (NGINX/ALB)      │      │      │
│   │  └───────────────────┘      │          │  └───────────────────┘      │      │
│   │                             │          │                             │      │
│   └─────────────────────────────┘          └─────────────────────────────┘      │
│                                                                                 │
│   OPERATIONS BY CLUSTER:                                                        │
│   ┌─────────────────────────────┐          ┌─────────────────────────────┐      │
│   │ HUB CLUSTER OPERATIONS:     │          │ SPOKE CLUSTER OPERATIONS:   │      │
│   │ ✓ Create ArgoCD apps        │          │ ✓ Get pods/deployments      │      │
│   │ ✓ Create repo secrets       │          │ ✓ Get services/ingress      │      │
│   │ ✓ Check sync status         │          │ ✓ Get LoadBalancer hostname │      │
│   │ ✓ Manage cluster secrets    │          │ ✓ Check certificates        │      │
│   │ ✗ Get app resources         │          │ ✓ View events/logs          │      │
│   │ ✗ Get LoadBalancer info     │          │ ✓ Create namespaces         │      │
│   └─────────────────────────────┘          └─────────────────────────────┘      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚨 Problem Patterns Detected

### Problem 1: Missing SPOKE_CLUSTER Variable

**Symptom**: Workflows only define `HUB_CLUSTER` but need to query spoke cluster resources.

**Bad Pattern**:
```yaml
env:
  HUB_CLUSTER: argocd-usw2
  # ❌ SPOKE_CLUSTER not defined!
```

**Good Pattern**:
```yaml
env:
  HUB_CLUSTER: argocd-usw2
  SPOKE_CLUSTER: opsera-usw2-np  # ✅ Always define both
```

---

### Problem 2: Wrong Cluster Context for Resource Operations

**Symptom**: Namespace created on hub, but apps deploy to spoke. Or querying ingress-nginx on hub when it's on spoke.

**Bad Pattern**:
```yaml
- name: Connect to Hub Cluster
  run: aws eks update-kubeconfig --name ${{ env.HUB_CLUSTER }} ...

- name: Create Namespace  # ❌ Creates on HUB!
  run: kubectl create namespace myapp-qa ...

- name: Get LoadBalancer  # ❌ Queries HUB!
  run: kubectl get svc -n ingress-nginx ...
```

**Good Pattern**:
```yaml
# For ArgoCD operations → use HUB
- name: Connect to Hub for ArgoCD
  run: aws eks update-kubeconfig --name ${{ env.HUB_CLUSTER }} ...

- name: Apply ArgoCD Application
  run: kubectl apply -f argocd/application.yaml

# For app resources → switch to SPOKE
- name: Connect to Spoke for Resources
  run: aws eks update-kubeconfig --name ${{ env.SPOKE_CLUSTER }} ...

- name: Get LoadBalancer  # ✅ Queries SPOKE
  run: kubectl get svc -n ingress-nginx ...
```

---

### Problem 3: No ArgoCD Cluster Connectivity Verification

**Symptom**: ArgoCD shows "Unknown" sync status because it can't reach spoke cluster.

**Bad Pattern**:
```yaml
- name: Apply ArgoCD Application
  run: kubectl apply -f argocd/application.yaml

- name: Verify
  run: |
    sleep 10
    kubectl get application myapp -n argocd  # ❌ No connectivity check!
```

**Good Pattern**:
```yaml
- name: Verify Spoke Cluster Connectivity
  run: |
    echo "🔍 Verifying ArgoCD can reach spoke cluster..."
    
    # Check cluster secret exists
    if ! kubectl get secret -n argocd -l argocd.argoproj.io/secret-type=cluster | grep -q "$SPOKE_CLUSTER"; then
      echo "❌ Spoke cluster not registered with ArgoCD!"
      echo "Run: argocd cluster add <cluster-context> --name $SPOKE_CLUSTER"
      exit 1
    fi
    
    echo "✅ Cluster secret found for $SPOKE_CLUSTER"

- name: Apply ArgoCD Application
  run: kubectl apply -f argocd/application.yaml

- name: Validate Sync Status
  run: |
    MAX_ATTEMPTS=30
    for i in $(seq 1 $MAX_ATTEMPTS); do
      STATUS=$(kubectl get app myapp -n argocd -o jsonpath='{.status.sync.status}')
      
      if [ "$STATUS" = "Synced" ]; then
        echo "✅ Application synced successfully"
        exit 0
      elif [ "$STATUS" = "Unknown" ]; then
        echo "❌ Sync status Unknown - cluster connectivity issue!"
        echo "Check: kubectl get secret $SPOKE_CLUSTER -n argocd"
        exit 1
      fi
      
      echo "[$i/$MAX_ATTEMPTS] Status: $STATUS - waiting..."
      sleep 10
    done
```

---

### Problem 4: ArgoCD Destination Misconfiguration

**Symptom**: ArgoCD app created with wrong destination, deploys to hub instead of spoke.

**Bad Pattern**:
```yaml
# application-qa.yaml
spec:
  destination:
    server: https://kubernetes.default.svc  # ❌ This is the HUB cluster!
    namespace: myapp-qa
```

**Good Pattern**:
```yaml
# application-qa.yaml
spec:
  destination:
    name: opsera-usw2-np  # ✅ Use cluster NAME, not server URL
    namespace: myapp-qa
```

**Rule**: 
- `server: https://kubernetes.default.svc` = deploy to where ArgoCD runs (HUB)
- `name: <cluster-name>` = deploy to registered external cluster (SPOKE)

---

### Problem 5: Webhook Conflicts Between Clusters

**Symptom**: `admission webhook denied the request: invalid ingress class`

**Root Cause**: Hub cluster has different admission webhooks (e.g., ALB) than spoke cluster (e.g., NGINX).

**Bad Pattern**: Trying to create NGINX ingress resources through ArgoCD on hub that has ALB webhook.

**Good Pattern**:
1. ArgoCD application destination should be spoke cluster (via `name:`)
2. ArgoCD syncs directly to spoke, bypassing hub's webhooks
3. If hub blocks, consider using ArgoCD's `Replace=true` sync option

---

## ✅ Reference Implementations

### Correct Bootstrap Workflow

```yaml
name: "🚀 Bootstrap Environment"

env:
  APP_NAME: myapp
  ENVIRONMENT: qa
  HUB_CLUSTER: argocd-usw2      # ArgoCD management
  SPOKE_CLUSTER: opsera-usw2-np  # Application workloads
  AWS_REGION: us-west-2

jobs:
  bootstrap:
    steps:
      # ════════════════════════════════════════════════════════════
      # PHASE 1: Hub Cluster Operations (ArgoCD)
      # ════════════════════════════════════════════════════════════
      - name: Connect to Hub Cluster
        run: aws eks update-kubeconfig --name ${{ env.HUB_CLUSTER }} --region ${{ env.AWS_REGION }}

      - name: Verify Spoke Cluster Registration
        run: |
          echo "🔍 Checking spoke cluster registration in ArgoCD..."
          if kubectl get secret -n argocd | grep -q "${{ env.SPOKE_CLUSTER }}"; then
            echo "✅ Spoke cluster registered"
          else
            echo "❌ Spoke cluster not registered!"
            echo "Register with: argocd cluster add <context> --name ${{ env.SPOKE_CLUSTER }}"
            exit 1
          fi

      - name: Create Repository Secret
        run: |
          kubectl create secret generic repo-${{ env.APP_NAME }} \
            --namespace argocd \
            --from-literal=url="$REPO_URL" \
            --from-literal=password="${{ secrets.GH_PAT }}" \
            --from-literal=username="git" \
            --from-literal=type=git \
            --dry-run=client -o yaml | kubectl apply -f -
          kubectl label secret repo-${{ env.APP_NAME }} -n argocd \
            argocd.argoproj.io/secret-type=repository --overwrite

      - name: Apply ArgoCD Application
        run: |
          kubectl apply -f .opsera-${{ env.APP_NAME }}/argocd/application-${{ env.ENVIRONMENT }}.yaml
          echo "✅ ArgoCD application created"

      - name: Validate Initial Sync
        run: |
          echo "⏳ Waiting for ArgoCD to begin sync..."
          sleep 15
          
          for i in {1..20}; do
            STATUS=$(kubectl get app ${{ env.APP_NAME }}-${{ env.ENVIRONMENT }} -n argocd \
              -o jsonpath='{.status.sync.status}' 2>/dev/null || echo "Pending")
            HEALTH=$(kubectl get app ${{ env.APP_NAME }}-${{ env.ENVIRONMENT }} -n argocd \
              -o jsonpath='{.status.health.status}' 2>/dev/null || echo "Pending")
            
            echo "[$i/20] Sync: $STATUS | Health: $HEALTH"
            
            if [ "$STATUS" = "Unknown" ]; then
              echo "⚠️ Warning: Sync status Unknown - possible cluster connectivity issue"
              echo "Checking cluster secret..."
              kubectl get secret -n argocd | grep cluster || true
            fi
            
            if [ "$STATUS" = "Synced" ]; then
              echo "✅ Initial sync complete"
              break
            fi
            
            sleep 10
          done

      # ════════════════════════════════════════════════════════════
      # PHASE 2: Spoke Cluster Operations (DNS, Verification)
      # ════════════════════════════════════════════════════════════
      - name: Connect to Spoke Cluster
        run: aws eks update-kubeconfig --name ${{ env.SPOKE_CLUSTER }} --region ${{ env.AWS_REGION }}

      - name: Verify Namespace Created
        run: |
          echo "🔍 Verifying namespace on spoke cluster..."
          kubectl get namespace ${{ env.APP_NAME }}-${{ env.ENVIRONMENT }} || \
            echo "⚠️ Namespace not yet created - ArgoCD will create it"

      - name: Get LoadBalancer for DNS
        run: |
          echo "🔍 Getting LoadBalancer hostname from spoke cluster..."
          LB_HOSTNAME=$(kubectl get svc -n ingress-nginx ingress-nginx-controller \
            -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
          
          if [ -n "$LB_HOSTNAME" ]; then
            echo "✅ LoadBalancer: $LB_HOSTNAME"
            echo "lb_hostname=$LB_HOSTNAME" >> $GITHUB_OUTPUT
          else
            echo "⚠️ LoadBalancer not ready - DNS will be configured after deployment"
          fi
```

### Correct ArgoCD Application Manifest

```yaml
# application-qa.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-qa
  namespace: argocd
  labels:
    app: myapp
    environment: qa
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  
  source:
    repoURL: https://github.com/org/repo.git
    targetRevision: main
    path: .opsera-myapp/k8s/overlays/qa
  
  destination:
    # ⚠️ CRITICAL: Use 'name' for spoke cluster, NOT 'server'
    name: opsera-usw2-np  # ✅ Registered cluster name
    namespace: myapp-qa
  
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true  # ArgoCD creates namespace on SPOKE
      - PrunePropagationPolicy=foreground
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### Correct Diagnostic Workflow

```yaml
name: "🔍 Diagnose Deployment"

env:
  APP_NAME: myapp
  ENVIRONMENT: qa
  HUB_CLUSTER: argocd-usw2
  SPOKE_CLUSTER: opsera-usw2-np

jobs:
  diagnose:
    steps:
      # ════════════════════════════════════════════════════════════
      # Check ArgoCD on HUB
      # ════════════════════════════════════════════════════════════
      - name: Check ArgoCD Status (Hub)
        run: |
          aws eks update-kubeconfig --name ${{ env.HUB_CLUSTER }} ...
          
          echo "📋 ArgoCD Application Status:"
          kubectl get app ${{ env.APP_NAME }}-${{ env.ENVIRONMENT }} -n argocd -o wide
          
          echo ""
          echo "🔍 Cluster Registration:"
          kubectl get secrets -n argocd -l argocd.argoproj.io/secret-type=cluster \
            -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}'

      # ════════════════════════════════════════════════════════════
      # Check Resources on SPOKE
      # ════════════════════════════════════════════════════════════
      - name: Check App Resources (Spoke)
        run: |
          aws eks update-kubeconfig --name ${{ env.SPOKE_CLUSTER }} ...
          
          echo "📦 Resources on Spoke Cluster:"
          kubectl get all,ingress -n ${{ env.APP_NAME }}-${{ env.ENVIRONMENT }}
```

---

## 🔧 Cluster Credential Refresh Workflow

Include this workflow for refreshing ArgoCD cluster credentials:

```yaml
# .github/workflows/refresh-argocd-cluster.yaml
name: "🔄 Refresh ArgoCD Cluster Credentials"

on:
  workflow_dispatch:
    inputs:
      cluster_name:
        description: 'Spoke cluster to refresh'
        required: true
        default: 'opsera-usw2-np'
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

env:
  HUB_CLUSTER: argocd-usw2
  AWS_REGION: us-west-2

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Install ArgoCD CLI
        run: |
          curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
          chmod +x argocd
          sudo mv argocd /usr/local/bin/

      - name: Connect to Hub Cluster
        run: aws eks update-kubeconfig --name ${{ env.HUB_CLUSTER }} --region ${{ env.AWS_REGION }}

      - name: Get ArgoCD Admin Password
        id: argocd
        run: |
          ARGOCD_PASSWORD=$(kubectl get secret argocd-initial-admin-secret -n argocd \
            -o jsonpath='{.data.password}' | base64 -d)
          echo "::add-mask::$ARGOCD_PASSWORD"
          echo "password=$ARGOCD_PASSWORD" >> $GITHUB_OUTPUT

      - name: Login to ArgoCD
        run: |
          ARGOCD_SERVER=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
          argocd login $ARGOCD_SERVER --username admin --password ${{ steps.argocd.outputs.password }} --insecure

      - name: Refresh Cluster Credentials
        run: |
          CLUSTER_NAME="${{ github.event.inputs.cluster_name || 'opsera-usw2-np' }}"
          
          echo "🔄 Refreshing credentials for cluster: $CLUSTER_NAME"
          
          # Get current cluster context
          aws eks update-kubeconfig --name $CLUSTER_NAME --region ${{ env.AWS_REGION }}
          
          # Remove and re-add cluster
          argocd cluster rm $CLUSTER_NAME --yes || true
          argocd cluster add $(kubectl config current-context) --name $CLUSTER_NAME --yes
          
          echo "✅ Cluster credentials refreshed"

      - name: Verify Cluster Connection
        run: |
          echo "🔍 Verifying cluster connection..."
          argocd cluster list | grep ${{ github.event.inputs.cluster_name || 'opsera-usw2-np' }}
```

---

## 📋 Pre-Deployment Checklist

Before deploying to a new environment, verify:

| Check | Command | Expected |
|-------|---------|----------|
| Hub cluster accessible | `aws eks update-kubeconfig --name argocd-usw2` | Success |
| Spoke cluster accessible | `aws eks update-kubeconfig --name opsera-usw2-np` | Success |
| Spoke registered in ArgoCD | `kubectl get secrets -n argocd -l argocd.argoproj.io/secret-type=cluster` | Contains spoke name |
| ArgoCD app destination | Check `destination.name` in app manifest | Should be spoke cluster name |
| Ingress class on spoke | `kubectl get ingressclass` (on spoke) | nginx or appropriate class |

---

## 🚫 Anti-Patterns to Avoid

1. **Never use `server: https://kubernetes.default.svc`** for apps that should deploy to spoke clusters
2. **Never create namespaces on hub** if apps run on spoke (use `CreateNamespace=true` in ArgoCD)
3. **Never query LoadBalancer/ingress on hub** - always switch to spoke context first
4. **Never assume cluster connectivity** - always verify before creating ArgoCD apps
5. **Never ignore "Unknown" sync status** - it indicates cluster connectivity issues

---

## 📊 Workflow Audit Summary

| Workflow | HUB_CLUSTER | SPOKE_CLUSTER | Correct Context Usage | Status |
|----------|-------------|---------------|----------------------|--------|
| ci-cd-*.yaml | ✅ | ❌ (not needed) | ✅ Hub for ArgoCD check | ✅ OK |
| bootstrap-*.yaml | ✅ | ⚠️ | ⚠️ Needs spoke for DNS | 🔧 Fix |
| bootstrap-qa-*.yaml | ✅ | ❌ Missing | ❌ Wrong cluster for all | 🔧 Fix |
| canary-*.yaml | ✅ | ✅ | ✅ Correctly uses spoke | ✅ OK |
| setup-https-*.yaml | ❌ (not needed) | ✅ | ✅ Correctly uses spoke | ✅ OK |
| diagnose-*.yaml | ✅ | ✅ | ✅ Uses both correctly | ✅ OK |

---

## 🔄 Files Requiring Updates

### 1. `.github/workflows/bootstrap-qa-plan-and-joy.yaml`

**Changes Required**:
- Add `SPOKE_CLUSTER: opsera-usw2-np` to env
- Remove namespace creation step (ArgoCD handles it)
- Switch to spoke cluster before querying ingress-nginx for DNS

### 2. `.github/workflows/bootstrap-plan-and-joy.yaml`

**Changes Required**:
- Add spoke cluster connectivity verification step
- Add sync status validation with Unknown detection
- Switch to spoke for DNS setup if needed

### 3. New: `.github/workflows/refresh-argocd-cluster.yaml`

**Add this workflow** for periodic cluster credential refresh.

---

## 📝 Learning Metadata

```yaml
learning_id: HUB-SPOKE-001
title: "Hub-Spoke ArgoCD Architecture for EKS"
category: devops
severity: critical
tags:
  - kubernetes
  - eks
  - argocd
  - hub-spoke
  - gitops
  - aws
  - cluster-management
  - admission-webhook
  - ingress
root_cause: |
  Workflows incorrectly mix hub and spoke cluster contexts, leading to:
  - Resources created on wrong cluster
  - ArgoCD "Unknown" sync status
  - DNS/ingress discovery failures
prevention:
  - Always define both HUB_CLUSTER and SPOKE_CLUSTER in workflow env
  - Use cluster NAME (not server URL) in ArgoCD destination
  - Verify cluster connectivity before creating ArgoCD apps
  - Query app resources on spoke, ArgoCD status on hub
affected_files:
  - .github/workflows/bootstrap-*.yaml
  - .opsera-*/argocd/application*.yaml
  - .github/workflows/diagnose-*.yaml
```
