import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const AccountSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const response = await api.get('/verification/status');
        setVerificationStatus(response.data);
      } catch (error) {
        console.error('Failed to fetch verification status:', error);
      }
    };
    fetchVerificationStatus();
  }, []);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth ? user.date_of_birth.split('T')[0] : '');
  
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setGender(user.gender || '');
      setDateOfBirth(user.date_of_birth ? user.date_of_birth.split('T')[0] : '');
    }
  }, [user]);
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentNumberError, setDocumentNumberError] = useState('');
  const [documentIssueDate, setDocumentIssueDate] = useState('');
  const [documentExpiryDate, setDocumentExpiryDate] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  
  const [addressCountry, setAddressCountry] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressZip, setAddressZip] = useState('');
  
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [businessRegNumber, setBusinessRegNumber] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!documentFile) {
      toast({
        title: "Error",
        description: "Please upload a document file",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingVerification(true);
    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('gender', gender);
      formData.append('date_of_birth', dateOfBirth);
      formData.append('place_of_birth', placeOfBirth);
      formData.append('nationality', nationality);
      formData.append('document_type', documentType);
      formData.append('document_number', documentNumber);
      if (documentIssueDate) formData.append('document_issue_date', documentIssueDate);
      if (documentExpiryDate) formData.append('document_expiry_date', documentExpiryDate);
      if (documentFile) formData.append('document_file', documentFile);
      formData.append('address_country', addressCountry);
      formData.append('address_city', addressCity);
      formData.append('address_street', addressStreet);
      formData.append('address_zip', addressZip);
      formData.append('business_name', businessName);
      formData.append('business_type', businessType);
      formData.append('business_reg_number', businessRegNumber);

      await api.post('/verification/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast({
        title: "Success",
        description: "Verification information submitted successfully",
      });
      
      // Refresh verification status
      const response = await api.get('/verification/status');
      setVerificationStatus(response.data);
      setVerificationStep(1);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to submit verification",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingVerification(false);
    }
  };


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Account Settings</h2>

      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted p-1">
          <TabsTrigger value="verification" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Verification</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showPasswordFields ? (
                <Button onClick={() => setShowPasswordFields(true)}>
                  Change Password
                </Button>
              ) : (
                <>
                  <div>
                    <Label>Current Password</Label>
                    <div className="relative mt-2">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>New Password</Label>
                    <div className="relative mt-2">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <div className="relative mt-2">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPasswordFields(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    >
                      {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Change Password
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <div className="space-y-6">
            {verificationStatus && verificationStatus.status !== 'not_submitted' && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Verification Status</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Submitted on {new Date(verificationStatus.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {verificationStatus.status === 'pending' && (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                          <span className="font-medium">Pending Review</span>
                        </div>
                      )}
                      {verificationStatus.status === 'approved' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Approved</span>
                        </div>
                      )}
                      {verificationStatus.status === 'rejected' && (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="w-5 h-5" />
                          <span className="font-medium">Rejected</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {verificationStatus.status === 'rejected' && verificationStatus.rejection_reason && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-900">Rejection Reason:</p>
                      <p className="text-sm text-red-800 mt-1">{verificationStatus.rejection_reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {(!verificationStatus || verificationStatus.status === 'not_submitted' || verificationStatus.status === 'rejected') && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium">Please Note</p>
                  <p className="text-sm text-blue-800 mt-1">The information you enter should match the information in your identification document</p>
                </div>

            {/* Step 1: Personal Info & Documents */}
            {verificationStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                      Personal Info & Documents *
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-500">Not verified</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-2" placeholder="If you have a middle name, include it here" />
                    </div>
                    <div>
                      <Label>Gender *</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Date of birth *</Label>
                      <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <Label>Place of birth *</Label>
                      <Input value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <Label>Nationality *</Label>
                      <Input value={nationality} onChange={(e) => setNationality(e.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <Label>Document Type *</Label>
                      <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="drivers_license">Driver's License</SelectItem>
                          <SelectItem value="nin">NIN (National ID)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>
                        {documentType === 'passport' && 'Passport Number *'}
                        {documentType === 'drivers_license' && "Driver's License Number *"}
                        {documentType === 'nin' && 'NIN Number *'}
                        {!documentType && 'Document Number *'}
                      </Label>
                      <Input 
                        value={documentNumber} 
                        onChange={(e) => {
                          const value = e.target.value;
                          setDocumentNumber(value);
                          
                          if (documentType === 'nin') {
                            if (!/^\d*$/.test(value)) {
                              setDocumentNumberError('NIN must contain only numbers');
                            } else if (value.length > 0 && value.length !== 11) {
                              setDocumentNumberError('NIN must be exactly 11 digits');
                            } else {
                              setDocumentNumberError('');
                            }
                          } else if (documentType === 'drivers_license') {
                            if (!/^[A-Za-z0-9-]*$/.test(value)) {
                              setDocumentNumberError('License can only contain letters, numbers, and hyphens');
                            } else if (value.length > 12) {
                              setDocumentNumberError('License must not exceed 12 characters');
                            } else {
                              setDocumentNumberError('');
                            }
                          } else {
                            setDocumentNumberError('');
                          }
                        }} 
                        className={`mt-2 ${documentNumberError ? 'border-red-500' : ''}`}
                        maxLength={documentType === 'nin' ? 11 : documentType === 'drivers_license' ? 12 : undefined}
                        placeholder={documentType === 'nin' ? '12345678901' : documentType === 'drivers_license' ? 'ABC-1234-5678' : ''}
                      />
                      {documentNumberError && <p className="text-sm text-red-500 mt-1">{documentNumberError}</p>}
                    </div>
                    {(documentType === 'passport' || documentType === 'drivers_license') && (
                      <>
                        <div>
                          <Label>Issue Date *</Label>
                          <Input type="date" value={documentIssueDate} onChange={(e) => setDocumentIssueDate(e.target.value)} className="mt-2" />
                        </div>
                        <div>
                          <Label>Expiry Date *</Label>
                          <Input type="date" value={documentExpiryDate} onChange={(e) => setDocumentExpiryDate(e.target.value)} className="mt-2" />
                        </div>
                      </>
                    )}
                    <div className="md:col-span-2">
                      <Label>Upload Document *</Label>
                      <div className="mt-2">
                        <label htmlFor="document-upload" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
                          Choose File
                        </label>
                        <input
                          id="document-upload"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        {documentFile && <p className="text-sm text-muted-foreground mt-2">{documentFile.name}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => setVerificationStep(2)}>Next</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Address */}
            {verificationStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                      Address *
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-500">Not verified</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Country *</Label>
                      <Input value={addressCountry} onChange={(e) => setAddressCountry(e.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <Label>City *</Label>
                      <Input value={addressCity} onChange={(e) => setAddressCity(e.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <Label>Street Address *</Label>
                      <Input value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <Label>ZIP/Postal Code *</Label>
                      <Input value={addressZip} onChange={(e) => setAddressZip(e.target.value)} className="mt-2" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setVerificationStep(1)}>Back</Button>
                    <Button onClick={() => setVerificationStep(3)}>Next</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Business */}
            {verificationStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                      Business
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-500">Not verified</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Business Name</Label>
                      <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <Label>Business Type</Label>
                      <Input value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="mt-2" />
                    </div>
                    <div>
                      <Label>Registration Number</Label>
                      <Input value={businessRegNumber} onChange={(e) => setBusinessRegNumber(e.target.value)} className="mt-2" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setVerificationStep(2)}>Back</Button>
                    <Button onClick={handleSubmitVerification} disabled={isSubmittingVerification}>
                      {isSubmittingVerification && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Submit Verification
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountSettings;
