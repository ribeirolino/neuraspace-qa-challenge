# Findings / Inconsistencies

Before writing the test cases, I would like to leave some findings/inconsistencies I found and, as a QA, I would clarify:

1. **The specification states** says that at least 3 messages are required to evaluate a conjunction and produce a status. However, in the JSON, the second item has `"warning_messages_analyzed": 2` and still shows `"status": "warning"`

2. **The ruleset table** names the baseline state Normal (no warning), whereas the sample JSON uses "status": "ok". This should be clarified.

3. ** In the sample JSON, items with `"probability_of_collision": 0.001` and `0.01` (and `miss_distance of 10000`) return `"status": "ok"`, which conflicts with the expected **Warning/Alert thresholds** or suggests an undocumented **fallback/default status** when conditions do not strictly match a rule. 
    - **Probability** = `0.01`: The exact value `0.01` is not covered by either condition;
    - **Miss Distance** = `10000 m`: The exact value `10000 m` has no explicit rule.
    - **Days** = `14` or `5`: The exact values `14` and `5` are not covered.

4. **There are some possibilities that are not covered**. Example: Probability = `0.005` (*Warning* range), Miss Distance = `8000 m` (*Warning* range), but Time of closest approach = `20 days` in the future (*Normal* range). Because the *Warning* rule combines its three conditions with `AND`, this scenario matches neither *Normal* nor *Warning*. What is the default fallback status?




# Test Cases

# Exercise 1 — Conjunction Analysis: Black-Box Integration Test Cases

| ID | Scenario | Preconditions / Steps / Inputs | Expected Behavior / Result |
| :--- | :--- | :--- | :--- |
| TC-01 | Send 2 messages | Send 2 warning messages with Alert parameters (`P = 0.05`). | Conjunction is not evaluated/returned with an active warning status (requires `>= 3` messages). |
| TC-02 | 3 messages | Send the 3rd warning message for matching Normal criteria. | Evaluation is triggered; `warning_messages_analyzed: 3`, status: `"ok"` (or `"normal"`). |
| TC-03 | Normal (Happy Path) | Assume 3 warning messages sent for the same conjunction. 3rd/latest message: `P = 0.00005`, Miss Distance = `15000 m`, TCA = `15 days`. | Status: `"ok"` / `"normal"`. |
| TC-04 | Warning (Probability + Distance + Time) | Assume 3 warning messages sent for the same conjunction. 3rd/latest message: `P = 0.005`, Miss Distance = `8000 m`, TCA = `10 days`. | Status: `"warning"`. |
| TC-05 | Warning (Critical Time & Distance) | Assume 3 warning messages sent for the same conjunction. 3rd/latest message: `P = 0.00001`, Miss Distance = `4000 m` (`< 5000 m`), TCA = `4 days` (`< 5d`). | Status: `"warning"`. |
| TC-06 | Alert (High Collision Probability) | Assume 3 warning messages sent for the same conjunction. 3rd/latest message: `P = 0.02` (`> 0.01`), Miss Distance = `50000 m`, TCA = `30 days`. | Status: `"alert"`. |
| TC-07 | Probability = 0.0001 (Lower boundary of Warning) | Assume 3 messages sent for the same conjunction. 3rd/latest message: `P = 0.0001`, `D = 9999 m`, TCA = `13d 23h`. | Status: `"warning"`. |
| TC-08 | Probability = 0.0000999 (Just below Warning) | Assume 3 messages sent for the same conjunction. 3rd/latest message: `P = 0.0000999`, `D = 10001 m`, TCA = `14d 1h`. | Should evaluate as `"ok"` / `"normal"`. |
| TC-09 | Boundary gap: Probability = 0.01 | Assume 3 messages sent for the same conjunction. 3rd/latest message: `P = 0.01`, `D = 9000 m`, TCA = `10d`. | Verify if it falls back to `"ok"`/`"normal"` or is treated as `"warning"`/`"alert"` given that it is not defined. |
| TC-10 | Boundary gap: Miss distance = 10000 m | Assume 3 messages sent for the same conjunction. 3rd/latest message: `P = 0.00005`, `D = 10000 m`, TCA = `15d`. | Verify exact boundary behavior (neither `> 10000` nor `< 10000` is explicitly defined). |
| TC-11 | Warning boundary: TCA < 5d and D < 5000 m | Assume 3 messages sent for the same conjunction. 3rd/latest message: `P = 0.0`, `D = 4999 m`, TCA = `4d 23h 59m`. | Should evaluate as `"warning"`. |
| TC-12 | Warning boundary (1 condition fails): D = 5000 m | Assume 3 messages sent for the same conjunction. 3rd/latest message: `P = 0.0`, `D = 5000 m`, TCA = `3d`. | Should not trigger Warning branch 2 (requires strictly `< 5000 m`). |
| TC-13 | Some fields are empty | `P` = empty, `D` = empty. | Confirm what should be the behavior here. |
| TC-14 | Wrong values for some fields | Put negative numbers for `P`, `D`, and TCA. | Confirm what should be the behavior here. |
| TC-15 | Past Time of Closest Approach (TCA < now) | Send 3 messages with `expected_date_of_collision` in the past. | Verify what is the behavior. Should be ignored? |
| TC-16 | Duplicate messages | Send the exact same payload 2 times in a row. | Check with the team what is expected |