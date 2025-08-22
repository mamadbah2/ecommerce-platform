# Configuration Supabase Storage pour les Images

## Étapes de configuration du bucket Supabase

### 1. Création du bucket
Vous avez déjà créé le bucket. Voici les étapes pour le configurer correctement :

1. Allez dans votre dashboard Supabase : https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans Storage > Buckets
4. Créez un bucket nommé `products` (si ce n'est pas déjà fait)

### 2. Configuration des politiques RLS (Row Level Security)

Pour permettre l'upload et la lecture des images, vous devez configurer les politiques RLS :

#### Politique pour l'upload (INSERT)
```sql
CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
```

#### Politique pour la lecture (SELECT)
```sql
CREATE POLICY "Allow public read access to product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');
```

#### Politique pour la suppression (DELETE)
```sql
CREATE POLICY "Allow authenticated users to delete their product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products' AND auth.role() = 'authenticated');
```

### 3. Configuration du bucket

1. Allez dans Storage > Settings
2. Pour le bucket `products`, configurez :
   - **Public** : ✅ Activé (pour permettre l'accès public aux images)
   - **File size limit** : 5MB
   - **Allowed mime types** : `image/png, image/jpeg, image/jpg, image/webp, image/gif`

### 4. Structure des dossiers

Les images sont organisées comme suit :
```
products/
├── sellers/
│   ├── sellerId1/
│   │   ├── timestamp1-hash.jpg
│   │   └── timestamp2-hash.png
│   └── sellerId2/
│       ├── timestamp3-hash.webp
│       └── timestamp4-hash.jpg
```

### 5. Vérification

Pour vérifier que tout fonctionne :

1. Testez l'upload d'une image depuis l'interface de création de produit
2. Vérifiez que l'image apparaît dans le bucket Supabase
3. Vérifiez que l'URL publique fonctionne

### 6. Sécurité

En production, assurez-vous de :
- Utiliser des variables d'environnement pour les clés Supabase
- Implémenter une authentification JWT pour les uploads
- Limiter les types de fichiers et les tailles
- Nettoyer les images non utilisées périodiquement

## Troubleshooting

### Erreur d'upload
- Vérifiez que le bucket `products` existe
- Vérifiez les politiques RLS
- Vérifiez que le bucket est public

### Images non visibles
- Vérifiez l'URL publique
- Vérifiez les politiques de lecture
- Vérifiez que le bucket est accessible publiquement
