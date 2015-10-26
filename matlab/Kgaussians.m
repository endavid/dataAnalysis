function K=Kgaussians(X,c,k);
% K=Kgaussians(X,c,k);
%
% X: the data in an array of the form n x d, where d is the dimension
%    of each vector, and n is the total number of samples
% c: the sigma of the gaussian
%    (A smaller sigma will make the kernel "darker")
% k: neighborhood
%
% Applies the gaussian kernel on the data getting the k-nearest neighbors.
% K will be sparse.
%
% See: Kgaussian, Kneighbors, Keuclidean, KPCA, KKmeans
%

% David Gavilan.

[n d]=size(X);

K=sparse([]);

for i=1:n
    D=X-repmat(X(i,:),n,1); % ones(n,1)*X(i,:)   
    Z=sparse(exp(-sum(D.^2,2)/c)); % K(:,i)
    for p=1:k
        [y,j]=max(Z);
        K(j,i)=y;
        K(i,j)=y; % make it symmetric
        Z(j)=0;
    end
end
