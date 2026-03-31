# Strapi CMS Scripts

Deno-based scripts for managing Strapi content import/export operations with advanced time-sensitive form management and automated outdated field updates.

## 📋 Configuration

Before running any scripts, ensure your environment is configured:

```bash
# Check configuration
strapi/config/settings.ts
```

**Get Google Drive Token:**\
[OAuth Playground](https://developers.google.com/oauthplayground/?code=4/0AeanS0bMiLmX3ldmdhaUxgzonGfgt0AZkRNcyQzYyasSRYmvBNTcXEDVDiowhoLLIsngsA&scope=https://www.googleapis.com/auth/drive%20https://www.googleapis.com/auth/drive.file%20https://www.googleapis.com/auth/drive.readonly%20https://www.googleapis.com/auth/spreadsheets%20https://www.googleapis.com/auth/spreadsheets.readonly%20https://www.googleapis.com/auth/tables)

---

## 🔢 **CRITICAL**: Sequence ID Management

### **Pre-Import**: Get Current Sequence Value

Before importing new forms, you **MUST** get the current sequence value from Strapi:

```bash
# Get current sequence value from Strapi
curl -X GET "https://essential-whisper-5a506b0cf9.strapiapp.com/api/internal/check-sequence" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
```

### **CSV Preparation**: Fill Sequence IDs

1. **Get Response**: Extract `currentSequenceValue` from the API response
2. **Calculate Next ID**: Add 1 to the current sequence value
3. **Fill CSV Columns**: 
   - `template_release_id`: Start with (currentSequenceValue + 1)
   - `strapi_id`: Same value as template_release_id
   - **Increment**: Each subsequent row gets the next sequential ID

**Example:**
```csv
template_release_id,strapi_id,template_name,...
16901,16901,Form A,...
16902,16902,Form B,...
16903,16903,Form C,...
```

### **Post-Import**: Staging Verification & Tracking

After importing to **staging environment**:

1. **Manual Verification**: 
   - Go to Strapi admin panel
   - Check that all imported forms are correct
   - Verify data integrity and relationships

2. **Update CSV for Tracking**:
   - Fill the `staging_strapi_id` column in your CSV
   - Use the actual Strapi IDs from the staging environment
   - This enables easy tracking and future operations

**CSV After Staging Verification:**
```csv
template_release_id,strapi_id,staging_strapi_id,template_name,...
16901,16901,16901,Form A,...
16902,16902,16902,Form B,...
16903,16903,16903,Form C,...
```

⚠️ **IMPORTANT**: Always verify staging data before proceeding to production!

---

## 🚀 **NEW** Template Import Workflow

### 🎯 **CRITICAL**: Time-Sensitive Logic Integration

The import process now requires **mandatory time-sensitive form checking** to ensure proper mapping and outdated field management.

### 1️⃣ **Pre-Import Setup & Validation**

**Get sequence ID and prepare CSV:**

```bash
# 🔢 STEP 1A: Get current sequence value from Strapi
curl -X GET "https://essential-whisper-5a506b0cf9.strapiapp.com/api/internal/check-sequence" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"

# 📝 STEP 1B: Fill template_release_id and strapi_id columns in CSV
# Use (currentSequenceValue + 1) and increment for each row
```

**Export current data and validate time-sensitive logic:**

```bash
# Export existing data for comparison
deno task strapi exportSlugFormDataAsJSON && deno task strapi exportCategoryDataAsJSON

# 🔥 MANDATORY: Export time-sensitive form data for mapping
deno task strapi exportTimeSensitiveFormDataAsJSON

# 🔥 MANDATORY: Check for new time-sensitive forms in CSV
deno task strapi checkNewTimeSensitiveFormsFromCSV
```

### 2️⃣ **Time-Sensitive Forms Creation (If Detected)**

⚠️ **ONLY run if new time-sensitive forms are detected in step 1:**

```bash
# Create new time-sensitive form groups
deno task strapi createTimeSensitiveFormsFromCSV
```

### 3️⃣ **Final Validation Before Import**

```bash
# Validate CSV templates with updated time-sensitive mapping
deno task strapi previewTemplatesCSV
```

---

### 4️⃣ **Asset Download & Processing**

```bash
# Download PDF files from CSV
deno task strapi downloadPDFFromCSV

# Generate thumbnail images from PDFs
deno task strapi genThumbnailImages

# Download Lumin files from CSV (optional)
deno task strapi downloadLuminFileFromCSV
```

---

### 5️⃣ **Form & Asset Upload**

```bash
# Upload new forms from CSV
deno task strapi uploadFormFromCSV

# Upload generated assets
deno task strapi uploadThumbnails
deno task strapi uploadPDFs
deno task strapi uploadLuminFiles  # If Lumin files were downloaded
```

---

### 6️⃣ **Data Updates & Verification**

```bash
# Update existing form data from CSV
deno task strapi updateFormDataFromCSV

# Verify import results
deno task strapi verifyAfterImport

# Export updated form data for records
deno task strapi exportFormDataAsJSON
```

---

### 7️⃣ **Staging Verification & CSV Update**

**After importing to staging environment:**

```bash
# 1. Manual verification in Strapi admin panel
# - Check all imported forms are correct
# - Verify data integrity and relationships
# - Confirm all assets (PDFs, thumbnails) are properly linked

# 2. Update CSV with staging IDs for tracking
# - Fill staging_strapi_id column with actual Strapi IDs
# - This enables easy tracking for future operations
```

**CSV Tracking Update:**
```csv
template_release_id,strapi_id,staging_strapi_id,template_name,...
16901,16901,16901,Form A,...  # Fill staging_strapi_id after verification
16902,16902,16902,Form B,...
16903,16903,16903,Form C,...
```

---

### 🎯 **RELEASE DAY ONLY**: Outdated Field Management

⚠️ **IMPORTANT**: These scripts should **ONLY** be run on release days, not after every import!

```bash
# Option 1: Standard outdated update (recommended)
deno task strapi updateOutdated

# Option 2: Alternative outdated update (comprehensive)
deno task strapi updateOutdatedAlternative
```

**Why Release Day Only?**
- These scripts re-map outdated attributes across all time-sensitive form groups
- Running after every import would cause incorrect outdated status
- Should only run when new templates are officially released to production

---

## 🚀 Pipeline Commands vs Individual Commands

### **Pipeline Commands** (Recommended)

Pipeline commands group related stages together for streamlined operations:

| Pipeline Command | Stages Combined | Use Case |
|-----------------|----------------|----------|
| `exportProductionDataAsJSON` | Export categories + time-sensitive forms + forms | Complete data export |
| `previewData` | Preview templates + check time-sensitive + validate outdated logic | Complete validation |
| `downloadPDF` | Download PDFs + generate thumbnails | Asset preparation |
| `importForm` | Upload forms + thumbnails + PDFs | Complete import |
| `updateOutdated` | Publish forms + update outdated fields | Standard outdated update |
| `updateOutdatedAlternative` | Export + preview + validate + update outdated | Comprehensive outdated update |

### **Individual Commands** (For Specific Operations)

Use individual commands when you need:
- Fine-grained control over specific operations
- Debugging individual steps
- Running only specific parts of a workflow
- Custom workflow combinations

---

## 📦 All Available Commands

### Form Operations

```bash
deno task strapi previewTemplatesCSV          # Validate CSV templates
deno task strapi uploadFormFromCSV            # Upload new forms
deno task strapi updateFormDataFromCSV        # Update forms from CSV
deno task strapi updateFormDataFromJSON       # Update forms from JSON
deno task strapi updateCustomForm             # Update specific form
deno task strapi findDuplicateReleaseId       # Find duplicate IDs
deno task strapi verifyAfterImport            # Verify import results
deno task strapi checkThumbnailsSort          # Check thumbnail sorting
```

### Category Operations

```bash
deno task strapi initCategories               # Initialize categories
deno task strapi exportCategoryDataAsCSV      # Export categories to CSV
deno task strapi exportCategoryDataAsJSON     # Export categories to JSON
```

### Time-Sensitive Form Operations

```bash
deno task strapi setupTimeSensitiveFormsFromCSV      # Complete setup (create + mark outdated)
deno task strapi createTimeSensitiveFormsFromCSV     # Create new time-sensitive forms
deno task strapi markFormsOutdatedInNewGroups        # Mark existing forms outdated
deno task strapi exportTimeSensitiveFormDataAsJSON   # Export time-sensitive forms
deno task strapi exportTimeSensitiveFormDataAsCSV    # Export time-sensitive forms to CSV
```

### Media Operations

```bash
deno task strapi genThumbnailImages           # Generate thumbnails
deno task strapi downloadPDFFromCSV           # Download PDFs
deno task strapi downloadLuminFileFromCSV     # Download Lumin files
```

### Upload Operations

```bash
deno task strapi uploadThumbnails             # Upload thumbnails
deno task strapi uploadPDFs                   # Upload PDFs
deno task strapi uploadLuminFiles             # Upload Lumin files
deno task strapi uploadThumbnailsFromJSON     # Upload thumbnails from JSON
deno task strapi uploadPDFsFromJSON           # Upload PDFs from JSON
deno task strapi reuploadFailedThumbnails     # Retry failed thumbnails
deno task strapi reuploadFailedPDFs           # Retry failed PDFs
deno task strapi updateMediaFileFromJSON      # Update media metadata
```

### Export Operations

```bash
deno task strapi exportFormDataAsJSON         # Export all forms
deno task strapi exportSlugFormDataAsJSON     # Export form slugs
deno task strapi exportFormDataAsCSV          # Export forms to CSV
deno task strapi exportCategoryDataAsJSON     # Export categories
deno task strapi exportCategoryDataAsCSV      # Export categories to CSV
deno task strapi exportTimeSensitiveFormDataAsJSON   # Export time-sensitive forms
deno task strapi exportTimeSensitiveFormDataAsCSV    # Export time-sensitive forms to CSV
```

---

## 🎯 Quick Copy Commands

### **NEW** Complete Import Workflow

```bash
# 🔢 STEP 0: Get sequence ID and prepare CSV
curl -X GET "https://essential-whisper-5a506b0cf9.strapiapp.com/api/internal/check-sequence" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json"
# Fill template_release_id and strapi_id columns with (currentSequenceValue + 1) and increment

# 🔥 STEP 1: Pre-import setup with mandatory time-sensitive checking
deno task strapi exportSlugFormDataAsJSON && deno task strapi exportCategoryDataAsJSON
deno task strapi exportTimeSensitiveFormDataAsJSON
deno task strapi checkNewTimeSensitiveFormsFromCSV

# 🔥 STEP 2: Create new time-sensitive forms (ONLY if detected in step 1)
# deno task strapi createTimeSensitiveFormsFromCSV  # Uncomment if needed

# STEP 3: Final validation
deno task strapi previewTemplatesCSV

# STEP 4: Download and process assets
deno task strapi downloadPDFFromCSV
deno task strapi genThumbnailImages
# deno task strapi downloadLuminFileFromCSV  # Optional

# STEP 5: Upload forms and assets
deno task strapi uploadFormFromCSV
deno task strapi uploadThumbnails
deno task strapi uploadPDFs
# deno task strapi uploadLuminFiles  # If Lumin files downloaded

# STEP 6: Update and verify
deno task strapi updateFormDataFromCSV
deno task strapi verifyAfterImport
deno task strapi exportFormDataAsJSON

# STEP 7: Staging verification and CSV update
# - Manually verify data in Strapi admin panel
# - Fill staging_strapi_id column in CSV for tracking

# 🎯 RELEASE DAY ONLY: Update outdated fields
# deno task strapi updateOutdated  # Only run on release day!
```

### **NEW** Update Existing Forms Workflow

```bash
# Step 1: Export current data with time-sensitive mapping
deno task strapi exportFormDataAsJSON
deno task strapi exportTimeSensitiveFormDataAsJSON

# Step 2: Check for time-sensitive changes
deno task strapi checkNewTimeSensitiveFormsFromCSV

# Step 3: Validate changes
deno task strapi previewTemplatesCSV

# Step 4: Update forms
deno task strapi updateFormDataFromCSV

# Step 5: Verify updates
deno task strapi verifyAfterImport
```

### **NEW** Grouped Pipeline Commands

These commands combine multiple stages into single operations for streamlined workflows:

```bash
# 🦊 EXPORT PIPELINE: Export all production data in one command
deno task strapi exportProductionDataAsJSON
# Combines: exportCategoryDataAsJSON + exportTimeSensitiveFormDataAsJSON + exportFormDataAsJSON

# 👁️ PREVIEW PIPELINE: Complete validation and preview
deno task strapi previewData  
# Combines: previewTemplatesCSV + checkNewTimeSensitiveFormsFromCSV + checkOutdatedLogic

# 📥 DOWNLOAD PIPELINE: Asset download and media generation
deno task strapi downloadPDF
# Combines: downloadPDFFromCSV + generateThumbnailsFromFile

# 📤 IMPORT PIPELINE: Complete form and asset upload
deno task strapi importForm
# Combines: uploadFormFromCSV + uploadThumbnails + uploadPDFs

# 🔄 OUTDATED UPDATE PIPELINE: Re-mapping logic (RELEASE DAY ONLY)
deno task strapi updateOutdated
# Single stage: publishFormsAndUpdateOutdated

# 🔄 COMPREHENSIVE OUTDATED PIPELINE: Full validation + re-mapping (RELEASE DAY ONLY)
deno task strapi updateOutdatedAlternative
# Combines: exportTimeSensitiveFormDataAsJSON + previewTemplatesCSV + checkOutdatedLogic + updateOutdatedFieldsByRule
```

**Pipeline Benefits:**
- ✅ Automated stage progression with proper logging
- ✅ Error handling across all stages
- ✅ Progress tracking and memory monitoring  
- ✅ Consistent emoji-based status indicators
- ✅ Professional execution banners and timing

---

## 🕒 **ENHANCED** Time-Sensitive Forms Management

Time-sensitive forms are groups of forms that share the same `time_sensitive_grouping` value in CSV. The system now requires **mandatory checking** before every import to ensure proper mapping.

### **NEW** Enhanced Workflow

1. **Pre-Check**: `exportTimeSensitiveFormDataAsJSON` exports current mapping
2. **Detection**: `checkNewTimeSensitiveFormsFromCSV` detects new time-sensitive groups
3. **Creation**: `createTimeSensitiveFormsFromCSV` creates new groups (only if needed)
4. **Validation**: `previewTemplatesCSV` validates with updated mapping
5. **Import**: Continue with normal import workflow
6. **Release Day**: `updateOutdated` or `updateOutdatedAlternative` re-maps outdated status

### **MANDATORY** Pre-Import Commands

```bash
# These MUST be run before every import:
deno task strapi exportTimeSensitiveFormDataAsJSON   # Export current mapping
deno task strapi checkNewTimeSensitiveFormsFromCSV   # Check for new groups

# Only run if new groups are detected:
deno task strapi createTimeSensitiveFormsFromCSV     # Create new groups
```

### **RELEASE DAY ONLY** Outdated Management

```bash
# Option 1: Standard outdated update
deno task strapi updateOutdated

# Option 2: Comprehensive outdated update (includes all validation steps)
deno task strapi updateOutdatedAlternative
```

### Additional Commands

```bash
# Export operations
deno task strapi exportTimeSensitiveFormDataAsJSON   # Export to JSON
deno task strapi exportTimeSensitiveFormDataAsCSV    # Export to CSV

# Validation and checking
deno task strapi checkOutdatedLogic                  # Check outdated logic only
```

### CSV Structure

The CSV should include a `time_sensitive_grouping` column:

```csv
template_release_id,template_name,time_sensitive_grouping,...
16860,Testing Form 3,Form Grouping 1,...
16861,Testing Form 4,Form Grouping 1,...
16852,Testing Form 5,Form Grouping 2,...
```

### Output Files

- **JSON**: `strapi/data/json/staging-time-sensitive-form.json` (or production)
- **CSV**: `strapi/data/time-sensitive-form-data.csv`

---

## 📁 Module Structure

```
strapi/
├── config/                    # Configuration files
├── data/                     # Data files (CSV, JSON, PDFs, thumbnails)
├── logs/                     # Error logs and processing reports
├── modules/                  # Modular service components
│   ├── form/                # Form operations
│   ├── upload/              # Upload operations
│   ├── category/            # Category operations
│   ├── media/               # Media operations
│   ├── time-sensitive-form/ # Time-sensitive form operations
│   └── strapi/              # Base Strapi service
└── utils/                   # Utility functions
```

---

## 🔧 Environment Variables

Required environment variables in `.env`:

```env
STRAPI_ENDPOINT=your_strapi_endpoint
STRAPI_API_TOKEN=your_api_token
ENVIRONMENT=production|staging
GOOGLE_ACCESS_TOKEN=your_google_token
```

---

## 📝 **UPDATED** Important Notes

### **CRITICAL** Pre-Import Requirements

- **MANDATORY**: Get current sequence value from Strapi API before importing
- **MANDATORY**: Fill `template_release_id` and `strapi_id` columns with sequential IDs
- **MANDATORY**: Always run `exportTimeSensitiveFormDataAsJSON` before importing
- **MANDATORY**: Always run `checkNewTimeSensitiveFormsFromCSV` to detect new groups
- Only run `createTimeSensitiveFormsFromCSV` if new time-sensitive groups are detected
- Always run `previewTemplatesCSV` after time-sensitive setup to validate mapping

### **CRITICAL** Post-Import Verification

- **MANDATORY**: Manually verify all imported data in Strapi admin panel
- **MANDATORY**: Fill `staging_strapi_id` column in CSV after staging verification
- This tracking enables easy identification and future operations on imported forms

### **RELEASE DAY ONLY** Outdated Field Updates

- `updateOutdated` and `updateOutdatedAlternative` should **ONLY** be run on release days
- These scripts re-map outdated attributes across all time-sensitive form groups
- Running after every import will cause incorrect outdated status
- Wait until new templates are officially released to production

### General Best Practices

- Check error logs in `strapi/logs/` after each operation
- Keep mapping files in `strapi/data/mapping-template/` until operations complete
- Use `verifyAfterImport` to ensure data integrity after import
- Use the new pipeline commands (`exportProductionDataAsJSON`, `previewData`, etc.) for streamlined operations
- Time-sensitive forms with new groups will mark existing forms as outdated automatically

### Pipeline Commands vs Individual Commands

- **Pipeline Commands**: Use for complete workflows (`exportProductionDataAsJSON`, `previewData`, `downloadPDF`, `importForm`, `updateOutdated`)
- **Individual Commands**: Use for specific operations or debugging individual steps
- Pipeline commands include proper logging, error handling, and progress tracking
