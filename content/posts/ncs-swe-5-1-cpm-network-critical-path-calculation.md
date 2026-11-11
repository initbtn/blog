---
title: "NCS 소프트웨어공학 [5-1] CPM 네트워크 임계경로(Critical Path) 계산과 PERT 3점 일정 관리"
slug: "ncs-swe-5-1-cpm-network-critical-path-calculation"
date: "2026-11-12"
summary: "NCS M5 킬러 유형 5-1: CPM 임계경로(Critical Path) 판별, 전진/후진 계산(ES·EF·LS·LF), 총 여유시간(TF) 공식 및 PERT 3점 가중평균 기대치 연산 프레임워크 완벽 정리."
tags: ["NCS", "소프트웨어공학", "프로젝트관리", "CPM", "PERT", "임계경로", "여유시간", "공무원7급"]
draft: false
---

## 1. 프로젝트 일정 관리와 네트워크 분석 기법

프로젝트 관리(Project Management)에서 정해진 납기와 예산 내에 시스템을 완성하기 위해서는 세부 작업(Activity) 간의 선후행 관계를 분석하고 전체 공정을 계획하는 네트워크 기법이 필수적입니다. 공무원 7급 및 자격 시험에서 M5 영역의 일정 관리 파트는 **"주어진 작업 표에서 최장 경로(임계경로)와 최소 완료 기간을 구하는 계산 문제"**와 **PERT 3점 기대치 공식**이 빈출됩니다.

- **출제 비중**: **GRADE D (7문항, 전체 기출의 1.6% — 고배점 계산 킬러)**
- **핵심 연산 포인트**:
  - 임계경로(Critical Path) = 소요 기간 합이 가장 긴 경로 ($\text{여유시간} = 0$)
  - 전진 계산(Forward Pass: $\text{Max}$) ➔ 조기 시작일(ES) / 조기 완료일(EF)
  - 후진 계산(Backward Pass: $\text{Min}$) ➔ 늦은 완료일(LF) / 늦은 시작일(LS)
  - PERT 베타 분포 3점 가중평균 공식: $\frac{t_O + 4t_M + t_P}{6}$

---

## 2. CPM(확정적) vs PERT(확률적) 핵심 비교

네트워크 중심 공정 관리의 양대 산맥인 CPM과 PERT는 작업 소요 시간의 성격(확정적 vs 확률적)에 따라 구분됩니다.

> 📌 *참고 자료 및 표준 출처*: [IT위키: 임계경로기법 (CPM)](https://itwiki.kr/w/%EC%9E%84%EA%B3%84%EA%B2%BD%EB%A1%9C%EA%B8%B0%EB%B2%95) & [IT위키: PERT](https://itwiki.kr/w/PERT)

| 구분 | CPM (Critical Path Method) | PERT (Program Evaluation and Review Technique) |
| :--- | :--- | :--- |
| **개발 배경** | 1957년 듀폰(DuPont)사 화학공장 건설 공정 관리 | 1958년 미국 해군 폴라리스 미사일 잠수함 개발 |
| **시간 추정** | **단일치 (확정적, Deterministic)** | **3점 추정치 (확률적, Probabilistic)** |
| **중심 대상** | 과거 유사 실적이 있는 **건설·제조·비용 중심** | 불확실성이 크고 처음 해보는 **연구개발(R&D)** |
| **핵심 활동** | 임계경로 식별 및 비용-일정 트레이드오프(Crashing) | 일정 확률 분포 분석 및 위험(표준편차) 측정 |

### PERT 3점 추정치(Three-Point Estimating) 연산 공식
작업의 불확실성을 감안하여 3가지 시나리오 시간치를 측정합니다:
- **낙관치 ($t_O$, Optimistic)**: 최상의 조건일 때 걸리는 최소 시간
- **최빈치 / 기대치 ($t_M$, Most Likely)**: 가장 현실적으로 발생 확률이 높은 정상 시간
- **비관치 ($t_P$, Pessimistic)**: 최악의 악조건일 때 걸리는 최대 시간

$$\mathbf{기대치(t_E) = \frac{t_O + 4t_M + t_P}{6}}$$

$$\mathbf{표준편차(\sigma) = \frac{t_P - t_O}{6}}, \quad \mathbf{분산(\sigma^2) = \left(\frac{t_P - t_O}{6}\right)^2}$$

---

## 3. 4대 시간 척도와 전진/후진 연산 프레임워크

각 작업 노드의 일정은 전진 계산과 후진 계산의 2단계 알고리즘으로 도출됩니다.

```text
┌─────────────────┬─────────────────┐
│  ES (조기시작)   │   EF (조기완료)  │
├─────────────────┴─────────────────┤
│       작업명 (소요기간: D)         │
├─────────────────┬─────────────────┤
│  LS (늦은시작)   │   LF (늦은완료)  │
└─────────────────┴─────────────────┘
```

### 1) 전진 계산 (Forward Pass) ➔ 프로젝트 시작부터 끝으로 전진
- **목적**: 작업이 가장 빨리 시작·종료될 수 있는 시점 도출
- **규칙 1 (조기 완료일)**: $\text{EF} = \text{ES} + \text{Duration}(D)$
- **규칙 2 (선행 작업이 여러 개일 때)**: $\mathbf{\text{ES} = \text{Max}(\text{선행 작업들의 EF})}$  
  *(모든 선행 작업이 다 끝나야 다음 작업을 시작할 수 있으므로 가장 늦게 끝난 시점을 채택!)*

### 2) 후진 계산 (Backward Pass) ➔ 프로젝트 종료부터 시작으로 역산
- **목적**: 납기를 지키기 위해 작업이 가장 늦게 시작·종료되어야 하는 한계 시점 도출
- **규칙 1 (늦은 시작일)**: $\text{LS} = \text{LF} - \text{Duration}(D)$
- **규칙 2 (후속 작업이 여러 개일 때)**: $\mathbf{\text{LF} = \text{Min}(\text{후속 작업들의 LS})}$  
  *(후속 작업들 중 가장 서둘러야 하는 작업의 시작 시점에 맞춰야 전체가 지연되지 않음!)*

---

## 4. 임계경로(Critical Path)와 여유시간(Float) 판별식

### 1) 총 여유시간 (Total Float, TF)
- 프로젝트 전체 완료일정에 영향을 주지 않으면서 해당 작업을 지연시킬 수 있는 최대 허용 시간입니다.
$$\mathbf{\text{TF} = \text{LS} - \text{ES} = \text{LF} - \text{EF}}$$

### 2) 자유 여유시간 (Free Float, FF)
- 후속 작업의 조기 시작일(ES)을 지연시키지 않고 가질 수 있는 순수 여유 시간입니다.
$$\mathbf{\text{FF} = \text{Min}(\text{후속 작업들의 ES}) - \text{해당 작업의 EF}}$$

### 3) 임계경로 (Critical Path, 주공정선)의 불변 법칙
1. **정의**: 네트워크의 시작 노드부터 종료 노드까지의 경로 중 **소요 기간의 총합이 가장 긴 경로**.
2. **여유시간 불변식**: 임계경로 상에 놓인 모든 작업은 **총 여유시간(Total Float)이 0**입니다 ($\text{TF} = 0$).
3. **지연의 전파**: 임계경로 상의 작업이 $N$일 지연되면, **전체 프로젝트 완료일정도 정확히 $N$일 지연**됩니다.
4. **일정 단축(Crashing)**: 전체 납기를 단축하려면 반드시 **임계경로 상에 있는 작업**의 기간을 단축해야만 효과가 있습니다.

---

## 5. 핵심 판별 키워드 치트시트 (Cheatsheet)

| 문제 지문 키워드 | 핵심 판별 및 연산 공식 |
| :--- | :--- |
| *"단일치 시간 추정, 확정적, 듀폰(DuPont), 비용-일정 최적화"* | **CPM (Critical Path Method)** |
| *"3점 추정(낙관/최빈/비관), 확률적, 미 해군 R&D"* | **PERT** |
| *"PERT 가중평균 기대치 계산"* | $\mathbf{(t_O + 4t_M + t_P) \div 6}$ |
| *"전진 계산 시 여러 선행 작업 중 선택 기준"* | **가장 큰 값 채택 ($\text{Max}$)** |
| *"후진 계산 시 여러 후속 작업 중 선택 기준"* | **가장 작은 값 채택 ($\text{Min}$)** |
| *"총 여유시간(Total Float) 공식"* | $\mathbf{\text{LS} - \text{ES} = \text{LF} - \text{EF}}$ |
| *"임계경로 상의 작업이 갖는 총 여유시간"* | **0 (여유 없음)** |

---

## 6. 공인 표준 및 참고 가이드

- [IT위키: 임계경로기법 (Critical Path Method)](https://itwiki.kr/w/%EC%9E%84%EA%B3%84%EA%B2%BD%EB%A1%9C%EA%B8%B0%EB%B2%95)
- [IT위키: PERT (Program Evaluation and Review Technique)](https://itwiki.kr/w/PERT)
- [위키백과: 주공정법 (Critical Path Method)](https://ko.wikipedia.org/wiki/%EC%A3%BC%EA%B3%B5%EC%A0%95%EB%B2%95)
