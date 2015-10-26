function K=Kgaussian(X,c);
% K=Kgaussian(X,c);
%
% X: the data in an array of the form n x d, where d is the dimension
%    of each vector, and n is the total number of samples
% c: the sigma of the gaussian
%    (A smaller sigma will make the kernel "darker")
%
% Applies the gaussian kernel on the data.
%
% See: KPCA, KKmeans
%

% David Gavilan.

[n d]=size(X);

K=exp(-Keuclidean(X)/c);

%for i=1:n
%    D=X-ones(n,1)*X(i,:);
    %K(:,i)=diag(D*D');  % slow for big n!!!
%    K(:,i)=sum(D.^2,2);       
%end
%K=exp(-K/c);