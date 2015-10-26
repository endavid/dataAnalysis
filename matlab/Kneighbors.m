function K=Kneighbors(GK,k);
% K=Kneighbors(GK,k)
%
% Selects k-nearest neighbors, given symmetric distance matrix GK
% Notice that neighborhood is not necessarily symmetric, so to make
% the matrix symmetric, just check one direction and replicate.
%
% Returns a sparse matrix.
%
% Ex. K=Kneighbors(Kgaussian(X,0.3),7);


% David Gavilan. 05/07/06

[n,n]=size(GK);

% 0-nearest neighbor is oneself
K=speye(n);
GK=GK-K;

for i=1:k
    [Y,I]=max(GK);
    Z=sparse([]); % zeros(n)
    for j=1:n
        Z(I(j),j)=Y(j);
        % make it symmetric
        Z(j,I(j))=Y(j); 
    end
    K=K+Z;
    GK=GK-Z;
end
