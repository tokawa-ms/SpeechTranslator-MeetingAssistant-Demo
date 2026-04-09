// --------------------------------------------------------------------------
// Azure Container Apps – multilangtranslator
// 既存の Container Apps Environment / Container Registry を参照して
// Container App をデプロイする Bicep テンプレート
// --------------------------------------------------------------------------

@description('Container App の名前')
param containerAppName string = 'multilangtranslator'

@description('既存の Container Apps Environment 名')
param environmentName string

@description('既存の Container Registry 名')
param containerRegistryName string

@description('コンテナイメージ名（タグ含む）')
param imageName string = 'multilangtranslator:latest'

@description('Speech Service のエンドポイント')
@secure()
param speechEndpoint string

@description('Azure OpenAI のエンドポイント')
@secure()
param openaiEndpoint string

@description('Azure OpenAI のデプロイメント名')
param openaiDeployment string = 'gpt-5.4-mini'

@description('簡易認証のユーザー名（空の場合は認証無効）')
@secure()
param userName string = ''

@description('簡易認証のパスワード（空の場合は認証無効）')
@secure()
param userPassword string = ''

// --------------------------------------------------------------------------
// 既存リソース参照
// --------------------------------------------------------------------------
resource environment 'Microsoft.App/managedEnvironments@2024-03-01' existing = {
  name: environmentName
}

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: containerRegistryName
}

// --------------------------------------------------------------------------
// Container App
// --------------------------------------------------------------------------
resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: resourceGroup().location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: acr.properties.loginServer
          username: acr.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: acr.listCredentials().passwords[0].value
        }
        {
          name: 'speech-endpoint'
          value: speechEndpoint
        }
        {
          name: 'openai-endpoint'
          value: openaiEndpoint
        }
        ...(!empty(userName)
          ? [
              {
                name: 'user-name'
                value: userName
              }
            ]
          : [])
        ...(!empty(userPassword)
          ? [
              {
                name: 'user-password'
                value: userPassword
              }
            ]
          : [])
      ]
    }
    template: {
      containers: [
        {
          name: containerAppName
          image: '${acr.properties.loginServer}/${imageName}'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'PORT'
              value: '3000'
            }
            {
              name: 'SPEECH_ENDPOINT'
              secretRef: 'speech-endpoint'
            }
            {
              name: 'OPENAI_ENDPOINT'
              secretRef: 'openai-endpoint'
            }
            {
              name: 'OPENAI_DEPLOYMENT'
              value: openaiDeployment
            }
            ...(!empty(userName)
              ? [
                  {
                    name: 'USER_NAME'
                    secretRef: 'user-name'
                  }
                ]
              : [])
            ...(!empty(userPassword)
              ? [
                  {
                    name: 'USER_PASSWORD'
                    secretRef: 'user-password'
                  }
                ]
              : [])
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '50'
              }
            }
          }
        ]
      }
    }
  }
}

// --------------------------------------------------------------------------
// Outputs
// --------------------------------------------------------------------------
output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output containerAppUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output principalId string = containerApp.identity.principalId
