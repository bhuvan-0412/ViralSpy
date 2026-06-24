# ViralSpy ML Pipeline

## Step 1: Generate Training Data

npm run generate-data
Takes ~20 minutes for 500 examples.
Costs: $0 (Groq free tier)
Output: training-data/viralspy-training.jsonl

## Step 2: Validate Data Quality

npm run validate-data
Check quality score is above 90%.

## Step 3: Prepare for Fine-tuning

npm run prepare-finetune
Output: training-data/alpaca-format.jsonl
training-data/chatml-format.jsonl

## Step 4: Fine-tune on Google Colab

Upload alpaca-format.jsonl to Google Colab.
Use Unsloth library for efficient LoRA fine-tuning.
See: https://github.com/unslothai/unsloth

## Step 5: Export and Run Locally

Export fine-tuned model to GGUF format.
Load into Ollama:
ollama create viralspy-llm -f Modelfile
Test in ViralSpy Settings:
Model: viralspy-llm
