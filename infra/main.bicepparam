using 'main.bicep'

param containerAppName = 'multilangtranslator'
param environmentName = readEnvironmentVariable('ENVIRONMENT_NAME', '')
param containerRegistryName = readEnvironmentVariable('CONTAINER_REGISTRY_NAME', '')
param imageName = 'multilangtranslator:latest'

// .env の値に置き換えてください
param speechEndpoint = readEnvironmentVariable('SPEECH_ENDPOINT', '')
param openaiEndpoint = readEnvironmentVariable('OPENAI_ENDPOINT', '')
param openaiDeployment = readEnvironmentVariable('OPENAI_DEPLOYMENT', 'gpt-4.1-mini')
param userName = readEnvironmentVariable('USER_NAME', '')
param userPassword = readEnvironmentVariable('USER_PASSWORD', '')
